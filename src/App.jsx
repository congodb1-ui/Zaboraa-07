import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const ADMIN_EMAIL = "congodb1@gmail.com"; // Change this to your email
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState(null);
  const isAdmin = session?.user?.email === ADMIN_EMAIL;
  const [activeTab, setActiveTab] = useState('studio');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserHistory(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserHistory(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserHistory = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('image_generations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setHistory(data.map(item => ({
          prompt: item.prompt,
          image: item.image_url,
          url: item.image_url,
          time: new Date(item.created_at).toLocaleTimeString()
        })));
      }
    } catch (err) {
      console.error('Error fetching tenant history:', err.message);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError(null);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Registration successful! Check your email or log in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setHistory([]);
    setCurrentImage(null);
  };

  const presets = [
    {
      title: 'HCX Hybrid Cloud Mesh',
      text: 'HCX Layer-2 network extension connecting on-premise VMware Cloud Foundation to Azure VMware Solution with high-speed encrypted tunnels'
    },
    {
      title: 'NSX Microsegmentation',
      text: 'VMware Aria Operations for Networks dependency mapping, security groups for Web, App, and DB tiers with distributed firewall rules'
    },
    {
      title: 'GCVE Disaster Recovery',
      text: 'Disaster recovery topology between enterprise private cloud and Google Cloud VMware Engine with automated site recovery'
    },
    {
      title: 'AWS VMware Cloud (VMC)',
      text: 'Enterprise hybrid cloud architecture diagram showing VMC on AWS interconnected with native AWS services and transit gateway'
    }
  ];

  const blueprints = [
    { title: 'Ministry of Commerce (MOCI) AVS Migration', type: 'Azure VMware Solution', desc: 'Multi-region enterprise migration architecture for legacy workloads.' },
    { title: 'GCVE Disaster Recovery Master Plan', type: 'Google Cloud VMware Engine', desc: 'Low-latency DR topology with VMware HCX and Cloud Volumes.' },
    { title: 'NSX-T Distributed Firewall Microsegmentation', type: 'Security Architecture', desc: 'Zero-trust architecture with L7 App-ID inspection and security groups.' }
  ];

  const handleGenerate = async (selectedPrompt = prompt) => {
    if (!selectedPrompt) return;
    
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    const token = currentSession ? currentSession.access_token : null;
    const userId = currentSession ? currentSession.user.id : 'congo-architect-session';

    setLoading(true);
    setError(null);
    setSavedStatus(false);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('http://localhost:3001/api/generate-image', {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt: selectedPrompt, userId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate image');

      const base64Src = `data:image/jpeg;base64,${data.image}`;
      setCurrentImage(base64Src);
      setCurrentImageUrl(data.imageUrl);
      if (data.imageUrl) setSavedStatus(true);

      if (currentSession) {
        fetchUserHistory(currentSession.user.id);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `zaboraa-architecture-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 w-3.5 h-3.5 rounded-full shadow-lg shadow-blue-500/50 animate-pulse"></div>
            <h1 className="text-xl font-bold tracking-tight text-white">Zaboraa <span className="text-blue-400 font-light">Technologies</span></h1>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{isSignUp ? 'Architect Registration' : 'Enterprise Portal Sign In'}</h2>
            <p className="text-xs text-slate-400 mt-1">Authenticate to access AI Cloud Architecture Studio & Secure Tenant Workspace.</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-medium">Architect Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@zaboraa.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-medium">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-950/50 border border-red-800 rounded-lg text-red-200 text-xs">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 font-medium py-3 rounded-lg transition shadow-lg shadow-blue-600/20 text-sm text-white"
            >
              {isSignUp ? 'Create Architect Account' : 'Authenticate Workspace'}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-blue-400 hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Enterprise Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 w-3.5 h-3.5 rounded-full shadow-lg shadow-blue-500/50 animate-pulse"></div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Zaboraa Technologies <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 font-mono">SaaS Portal v2.5</span>
            </h1>
            <p className="text-xs text-slate-400">Tenant: <span className="text-blue-400">{session.user.email}</span></p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button 
            onClick={() => setActiveTab('studio')} 
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition ${activeTab === 'studio' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            AI Architecture Studio
          </button>
          <button 
            onClick={() => setActiveTab('blueprints')} 
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition ${activeTab === 'blueprints' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Migration Blueprints
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition ${activeTab === 'history' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Cloud Storage & History ({history.length})
          </button>
        
          {/* ONLY SHOWS FOR YOU */}
          {isAdmin && (
            <button 
              onClick={() => setActiveTab('admin')} 
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition ${activeTab === 'admin' ? 'bg-red-600 text-white shadow' : 'text-red-400 hover:text-white'}`}
            >
              Admin Panel
            </button>
          )}
        </nav>

        <div className="flex items-center space-x-4 text-xs">
          <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Vertex AI Active
          </span>
          <button
            onClick={handleLogout}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition border border-slate-700"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8">
        
        {activeTab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Control Column */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-400 mb-4">Architecture Generator Studio</h2>
                
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-medium">Quick Enterprise Presets</label>
                <div className="space-y-2 mb-5">
                  {presets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setPrompt(preset.text); handleGenerate(preset.text); }}
                      className="w-full text-left text-xs bg-slate-950 hover:bg-blue-950/30 border border-slate-800 hover:border-blue-500/50 rounded-lg p-3 transition text-slate-300 group"
                    >
                      <span className="font-semibold text-white block mb-0.5 group-hover:text-blue-400">{preset.title}</span>
                      <span className="text-slate-400 line-clamp-1">{preset.text}</span>
                    </button>
                  ))}
                </div>

                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-medium">Custom Architecture Prompt</label>
                <textarea
                  rows="4"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your VCF, AVS, HCX or multi-cloud topology..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 transition mb-4 resize-none"
                />

                <button
                  onClick={() => handleGenerate(prompt)}
                  disabled={loading || !prompt}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 font-medium py-3 rounded-lg transition shadow-lg shadow-blue-600/20 text-sm flex justify-center items-center space-x-2 text-white"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Rendering via Vertex AI & Supabase...</span>
                    </>
                  ) : (
                    <span>Generate & Sync to Tenant Workspace</span>
                  )}
                </button>

                {error && (
                  <div className="mt-4 p-3 bg-red-950/50 border border-red-800 rounded-lg text-red-200 text-xs">
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Preview Workspace */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl flex flex-col justify-start relative">
                
                {/* Top Action Bar */}
                <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Live Architecture Canvas</span>
                    {savedStatus && (
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        ✓ Synced to Supabase Storage
                      </span>
                    )}
                  </div>

                  {currentImage && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleDownloadImage}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                        <span>Save JPG</span>
                      </button>
                    </div>
                  )}
                </div>
                
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-slate-400">Synthesizing cloud topology and syncing with Supabase...</p>
                  </div>
                ) : currentImage ? (
                  <div className="w-full rounded-lg overflow-hidden border border-slate-700 shadow-2xl bg-slate-950 flex justify-center">
                    <img src={currentImage} alt="Generated Architecture" className="w-full object-contain max-h-[520px]" />
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-28 space-y-3">
                    <svg className="w-14 h-14 mx-auto opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2,2 0 012-2h0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                    <p className="text-sm">Select an enterprise preset or enter a custom prompt to build your architecture schematic.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'blueprints' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">Reference Migration Blueprints</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blueprints.map((bp, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">{bp.type}</span>
                    <h3 className="text-base font-semibold text-white mt-2">{bp.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{bp.desc}</p>
                  </div>
                  <button 
                    onClick={() => { setActiveTab('studio'); setPrompt(bp.desc); handleGenerate(bp.desc); }}
                    className="w-full bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-200 text-xs py-2 rounded-lg transition font-medium border border-slate-700"
                  >
                    Simulate & Generate Diagram
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">Tenant Cloud Storage & History</h2>
            {history.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
                No diagrams found in your tenant workspace yet. Head over to the Studio tab to create your first architecture schematic.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {history.map((item, idx) => (
                  <div key={idx} onClick={() => { setCurrentImage(item.image); setCurrentImageUrl(item.url); setActiveTab('studio'); }} className="cursor-pointer bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-xl p-4 transition group shadow-lg">
                    <img src={item.image} alt="Architecture Thumbnail" className="w-full h-36 object-cover rounded-lg mb-3 group-hover:opacity-90" />
                    <p className="text-xs text-slate-200 line-clamp-2 font-medium mb-2">{item.prompt}</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>{item.time}</span>
                      <span className="text-blue-400 underline">View Canvas</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. ADMIN PANEL VIEW BLOCK ADDED HERE */}
        {activeTab === 'admin' && isAdmin && (
          <div className="space-y-6">
            <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-2">Master Administrator Dashboard</h2>
              <p className="text-xs text-slate-400 mb-6">Welcome, Administrator. You have global oversight of the Zaboraa SaaS portal.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-white mb-1">System Status</h3>
                  <p className="text-xs text-slate-400">Vertex AI API: <span className="text-emerald-400">Connected</span></p>
                  <p className="text-xs text-slate-400">Supabase DB: <span className="text-emerald-400">Active</span></p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-white mb-1">Tenant Control</h3>
                  <p className="text-xs text-slate-400">Current Logged-in User: <span className="text-blue-400">{session.user.email}</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
