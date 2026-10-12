import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);

  const presets = [
    {
      title: 'HCX Hybrid Cloud Mesh',
      text: 'HCX Layer-2 network extension connecting on-premise VMware Cloud Foundation to Azure VMware Solution with high-speed encrypted tunnels',
    },
    {
      title: 'NSX Microsegmentation',
      text: 'VMware Aria Operations for Networks dependency mapping, security groups for Web, App, and DB tiers with distributed firewall rules',
    },
    {
      title: 'GCVE Disaster Recovery',
      text: 'Disaster recovery topology between enterprise private cloud and Google Cloud VMware Engine with automated site recovery',
    },
    {
      title: 'AWS VMware Cloud (VMC)',
      text: 'Enterprise hybrid cloud architecture diagram showing VMC on AWS interconnected with native AWS services and transit gateway',
    },
  ];

  const handleGenerate = async (selectedPrompt: string = prompt) => {
    if (!selectedPrompt.trim()) return;

    setLoading(true);
    setError('');
    setImageUrl('');
    setSavedStatus(false);

    try {
      // Get current active Supabase session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session ? session.access_token : null;
      const userId = session ? session.user.id : 'congo-architect-session';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('http://localhost:3001/api/generate-image', {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt: selectedPrompt, userId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate architecture schematic');

      const imageSrc = data.imageUrl || `data:image/jpeg;base64,${data.image}`;
      setImageUrl(imageSrc);

      if (data.imageUrl) {
        setSavedStatus(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `zaboraa-architecture-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto my-8 font-sans text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 w-3 h-3 rounded-full shadow-lg shadow-blue-500/50 animate-pulse"></div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">
              Enterprise 4K Architecture & 3D Blueprint Engine
            </h2>
            <p className="text-xs text-slate-400">Powered by Vertex AI & Supabase Tenant Sync</p>
          </div>
        </div>
        {savedStatus && (
          <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full flex items-center gap-1">
            ✓ Synced to Cloud Workspace
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Presets & Control Column */}
        <div className="md:col-span-1 space-y-4">
          <label className="block text-xs uppercase tracking-wider text-slate-400 font-medium">
            Enterprise Blueprint Presets
          </label>
          <div className="space-y-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(preset.text);
                  handleGenerate(preset.text);
                }}
                className="w-full text-left text-xs bg-slate-950 hover:bg-blue-950/30 border border-slate-800 hover:border-blue-500/50 rounded-lg p-3 transition text-slate-300 group"
              >
                <span className="font-semibold text-white block mb-0.5 group-hover:text-blue-400">
                  {preset.title}
                </span>
                <span className="text-slate-400 line-clamp-2 text-[11px]">
                  {preset.text}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Form & Preview Canvas */}
        <div className="md:col-span-2 space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
            className="space-y-3"
          >
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-medium">
              Architecture Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your VCF, AVS, HCX or multi-cloud topology..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-blue-500 transition resize-none"
              rows={4}
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white py-2.5 rounded-lg text-xs font-semibold transition shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Synthesizing Topology...</span>
                </>
              ) : (
                <span>Generate Architecture Blueprint</span>
              )}
            </button>
          </form>

          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800 rounded-lg text-red-200 text-xs">
              {error}
            </div>
          )}

          {/* Live Canvas Output */}
          <div className="border border-slate-800 bg-slate-950 rounded-xl p-4 min-h-[260px] flex items-center justify-center relative">
            {imageUrl ? (
              <div className="w-full space-y-3">
                <img
                  src={imageUrl}
                  alt="Generated Cloud Architecture"
                  className="w-full rounded-lg border border-slate-800 object-contain max-h-[380px]"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleDownload}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    <span>Download Blueprint</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 space-y-2 py-8">
                <svg
                  className="w-10 h-10 mx-auto opacity-30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2v0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <p className="text-xs">
                  Select a preset or enter a prompt above to generate a schematic.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};