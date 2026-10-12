import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useCustomization } from '../context/CustomizationContext';
import {
  Search,
  Sliders,
  Calendar,
  Menu,
  X,
  Sun,
  Moon,
  Lock,
  Unlock,
  ChevronDown,
  Layers,
  Cpu,
  FileSpreadsheet,
  ShieldAlert,
  HardDrive,
  BookOpen,
  Film,
  FileText,
  ExternalLink,
  FolderGit2,
  Network,
  Sparkles
} from 'lucide-react';
import { GOOGLE_DRIVE_CONFIG } from '../data/mediaAssets';
import { ZaboraaLogoMark } from './ZaboraaLogo';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const {
    siteConfig,
    theme,
    toggleTheme,
    isAdmin,
    setIsAdminLoginModalOpen,
    setIsCustomizerOpen,
    setIsBriefingModalOpen,
    setIsSearchOpen
  } = useCustomization();

  const { user: authUser, subscriptionTier: licenseTier, setIsCommercializeModalOpen } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'disciplines' | 'tools' | 'resources' | null>(null);

// Vertex AI Live Connection Status State via Supabase / Auth Session
  const [vertexStatus, setVertexStatus] = useState<'checking' | 'connected' | 'disconnected'>('connected');

  useEffect(() => {
    // Check if Supabase client is configured and responding
    if (supabase && supabase.auth) {
      supabase.auth.getSession()
        .then(() => setVertexStatus('connected'))
        .catch(() => setVertexStatus('disconnected'));
    } else {
      setVertexStatus('disconnected');
    }
  }, []);

  // Close dropdowns on outside click or navigation
  const navRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleDropdown = (key: 'disciplines' | 'tools' | 'resources') => {
    setOpenDropdown(prev => (prev === key ? null : key));
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap shrink-0 transition-colors text-xs font-semibold py-1 px-2.5 rounded-md ${
      isActive
        ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30'
        : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div
        ref={navRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-6 relative"
      >
        {/* Subtle ambient brand glow in navbar */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-48 h-8 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Zone 1: Brand Wordmark & Architectural Emblem */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0 relative z-10">
          <ZaboraaLogoMark sizeClass="w-9 h-9 sm:w-10 sm:h-10" />
          <span className="flex flex-col tracking-tight select-none">
            <span className="flex items-center gap-1.5 leading-none">
              <span className="text-base sm:text-lg font-black tracking-tight text-white font-sans group-hover:text-cyan-300 transition-colors">
                ZABORAA
              </span>
              <span className="text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 uppercase shadow-sm group-hover:border-cyan-400 group-hover:bg-cyan-900/60 transition-all">
                TECHNOLOGIES
              </span>
            </span>
            <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-semibold mt-1 group-hover:text-cyan-300/80 transition-colors hidden sm:block">
              Multi-Cloud VMware Architecture
            </span>
          </span>
        </Link>

        {/* Zone 2: Navigation Links & Accessible Dropdowns */}
        <nav className="hidden lg:flex items-center gap-2 xl:gap-3 text-xs font-semibold text-slate-300">
          {/* Disciplines Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('disciplines')}
              className={`flex items-center gap-1 py-1.5 px-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                location.pathname.startsWith('/disciplines') || openDropdown === 'disciplines'
                  ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <span>Disciplines</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openDropdown === 'disciplines' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openDropdown === 'disciplines' && (
              <div className="absolute top-full left-0 mt-2 w-72 p-2 rounded-xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-xl z-50 space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-slate-500 border-b border-slate-800/80 mb-1">
                  Cloud Architectures
                </div>
                {(siteConfig.platformShowcases || []).map(p => (
                  <Link
                    key={p.id}
                    to={`/disciplines/${p.id}`}
                    className="flex flex-col px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-400">
                        {p.title}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400/80">
                        {p.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate mt-0.5">
                      {p.platform}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Tools Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('tools')}
              className={`flex items-center gap-1 py-1.5 px-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                location.pathname.startsWith('/tools') || openDropdown === 'tools'
                  ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <span>Tools</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openDropdown === 'tools' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openDropdown === 'tools' && (
              <div className="absolute top-full left-0 mt-2 w-80 p-2 rounded-xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-xl z-50 space-y-1">
                <Link
                  to="/tools"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors text-xs font-bold text-cyan-400 border-b border-slate-800/80 pb-2 mb-1"
                >
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Workbench Overview Hub</span>
                </Link>
                <Link
                  to="/tools/sizing"
                  className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors group"
                >
                  <HardDrive className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-400">
                      Node & Decoupled Storage Sizing
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ANF / FSx ONTAP node reduction estimator
                    </div>
                  </div>
                </Link>
                <Link
                  to="/tools/rvtools-analyzer"
                  className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors group"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">
                      RVTools Migration Readiness Engine
                    </div>
                    <div className="text-[10px] text-slate-400">
                      In-browser .xlsx parser & HCX wave mapping
                    </div>
                  </div>
                </Link>
                <Link
                  to="/tools/nutanix-nc2-assessment"
                  className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors group"
                >
                  <Cpu className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300">
                      Nutanix NC2 on Azure Assessment
                    </div>
                    <div className="text-[10px] text-slate-400">
                      AHV VirtIO audit & Azure bare-metal node sizing
                    </div>
                  </div>
                </Link>
                <Link
                  to="/tools/aria-networks"
                  className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors group"
                >
                  <Network className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                      Aria Networks (vRNI) Data Engine
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Flow analytics, app tiers & NSX DFW rules
                    </div>
                  </div>
                </Link>
                <Link
                  to="/tools/dr-planner"
                  className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors group"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-rose-400">
                      DR RPO/RTO & Replication Calculator
                    </div>
                    <div className="text-[10px] text-slate-400">
                      WAN bandwidth & SRM protection groups
                    </div>
                  </div>
                </Link>
                <Link
                  to="/tools/design-generator"
                  className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors group"
                >
                  <Layers className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-400">
                      Automated Hybrid Blueprint Generator
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Dynamic BOM deliverable & Google Drive export
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Direct Link: Blueprints */}
          <NavLink to="/blueprints" className={navLinkClass}>
            Blueprints
          </NavLink>

          {/* Direct Link: Roadmap */}
          <NavLink to="/roadmap" className={navLinkClass}>
            Roadmap
          </NavLink>

          {/* Knowledge Hub Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('resources')}
              className={`flex items-center gap-1 py-1.5 px-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                location.pathname.startsWith('/resources') || openDropdown === 'resources'
                  ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <span>Knowledge Hub</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openDropdown === 'resources' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openDropdown === 'resources' && (
              <div className="absolute top-full left-0 mt-2 w-72 p-2 rounded-xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-xl z-50 space-y-1">
                <Link
                  to="/resources"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors text-xs font-bold text-cyan-400 border-b border-slate-800/80 pb-2 mb-1"
                >
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>All Resources Portal</span>
                </Link>
                <Link
                  to="/resources/kb"
                  className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors group"
                >
                  <BookOpen className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">
                      KB Production Runbooks
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Verified operational fix playbooks
                    </div>
                  </div>
                </Link>
                <Link
                  to="/resources/tutorials"
                  className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors group"
                >
                  <FileText className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-400">
                      Software Tutorials & Automation
                    </div>
                    <div className="text-[10px] text-slate-400">
                      PowerCLI and IaC architecture guides
                    </div>
                  </div>
                </Link>
                <Link
                  to="/resources/videos"
                  className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors group"
                >
                  <Film className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-400">
                      Video Masterclasses Archive
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Architectural walkthroughs & demos
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Direct Link: Case Studies */}
          <NavLink to="/case-studies" className={navLinkClass}>
            Case Studies
          </NavLink>

          {/* Direct Link: About */}
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
        </nav>

        {/* Zone 3: Primary Actions & Admin & Theme */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Vertex AI Live Status Indicator Badge */}
          <div className="hidden xl:flex items-center">
            {vertexStatus === 'connected' ? (
              <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Vertex AI Active
              </span>
            ) : vertexStatus === 'checking' ? (
              <span className="bg-slate-900 text-slate-400 border border-slate-800 px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                Checking Vertex...
              </span>
            ) : (
              <span className="bg-red-950/80 text-red-300 border border-red-800 px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Vertex AI Disconnected
              </span>
            )}
          </div>

          {/* Google Drive Link */}
          <a
            href={GOOGLE_DRIVE_CONFIG.folderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-cyan-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors"
            title="Open Dedicated Google Drive Storage Folder"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-mono">Cloud Drive</span>
          </a>

          {/* Global Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to High-Contrast Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
            )}
          </button>

          {/* Search Button (Ctrl+K) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors cursor-pointer"
            title="Search across all platforms, tools, and runbooks (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <kbd className="hidden sm:inline px-1 py-0.2 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Admin Lock / Customizer Trigger */}
          {isAdmin ? (
            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 rounded-md transition-colors cursor-pointer"
              title="Open site customizer drawer"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Customize</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAdminLoginModalOpen(true)}
              className="flex items-center justify-center p-1.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              title="Admin Mode login"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Commercialization & Google Account Trigger */}
          <button
            onClick={() => setIsCommercializeModalOpen(true)}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              authUser
                ? 'bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200'
                : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Commercialize tools, pricing tiers, and Google Authentication"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[120px]">{authUser ? authUser.displayName?.split(' ')[0] : 'Sign In / Pro'}</span>
            <span className={`text-[9px] font-mono px-1 py-0.2 rounded uppercase font-bold ${
              licenseTier === 'pro' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
            }`}>
              {licenseTier === 'pro' ? 'PRO' : 'FREE'}
            </span>
          </button>

          {/* Primary CTA Button: Book Briefing */}
          <button
            onClick={() => setIsBriefingModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-all shadow-sm hover:scale-105 cursor-pointer whitespace-nowrap"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Briefing</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-md bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950 px-4 pt-4 pb-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Mobile Vertex Status Banner */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400">Vertex AI Status:</span>
            {vertexStatus === 'connected' ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Active
              </span>
            ) : (
              <span className="text-red-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Disconnected
              </span>
            )}
          </div>

          <div className="space-y-1">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-900"
            >
              Home Overview
            </NavLink>
            <NavLink
              to="/tools"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-cyan-400 hover:bg-slate-900"
            >
              Engineering Workbench (6 Tools)
            </NavLink>
            <div className="pl-4 space-y-1 text-xs font-medium text-slate-400">
              <Link to="/tools/sizing" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-cyan-300">
                · Node & Storage Sizing
              </Link>
              <Link to="/tools/rvtools-analyzer" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-emerald-300">
                · RVTools Readiness Engine
              </Link>
              <Link to="/tools/nutanix-nc2-assessment" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-emerald-300">
                · Nutanix NC2 on Azure Assessment
              </Link>
              <Link to="/tools/aria-networks" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-cyan-300">
                · Aria Networks & DFW Planner
              </Link>
              <Link to="/tools/dr-planner" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-rose-300">
                · DR RPO/RTO Calculator
              </Link>
              <Link to="/tools/design-generator" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-indigo-300">
                · Automated Blueprint Generator
              </Link>
            </div>
            <NavLink
              to="/blueprints"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-900"
            >
              Interactive Blueprints
            </NavLink>
            <NavLink
              to="/roadmap"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-900"
            >
              Migration Roadmap
            </NavLink>
            <NavLink
              to="/resources"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-900"
            >
              Knowledge Hub (KB, Tutorials, Videos)
            </NavLink>
            <NavLink
              to="/case-studies"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-900"
            >
              Case Studies
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-900"
            >
              About Principal Architect
            </NavLink>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsCommercializeModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Commercialize Tools & Sign Up</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-900 text-cyan-200 uppercase font-bold">
                {licenseTier === 'pro' ? 'PRO' : 'FREE'}
              </span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 text-xs space-y-2">
            <div className="font-mono text-slate-500 uppercase text-[10px]">Architectural Disciplines</div>
            <div className="grid grid-cols-2 gap-2">
              {(siteConfig.platformShowcases || []).map(p => (
                <Link
                  key={p.id}
                  to={`/disciplines/${p.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-cyan-300"
                >
                  {p.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
