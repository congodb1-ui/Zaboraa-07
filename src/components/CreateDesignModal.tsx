import { supabase } from '../supabaseClient';
import React, { useState, useRef, useEffect } from 'react';
import { useCustomization } from '../context/CustomizationContext';
import { ArchitectureDesignItem } from '../types/siteData';
import {
  X,
  Upload,
  Plus,
  Save,
  Trash2,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Check
} from 'lucide-react';

interface CreateDesignModalProps {
  platformId: string | null;
  existingDesignId?: string | null;
  onClose: () => void;
}

export const CreateDesignModal: React.FC<CreateDesignModalProps> = ({
  platformId,
  existingDesignId,
  onClose
}) => {
  const { siteConfig, addPlatformDesign, updatePlatformDesign } = useCustomization();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const platform = siteConfig.platformShowcases?.find(p => p.id === platformId);
  const existingDesign = platform?.designs?.find(d => d.id === existingDesignId);

  const [title, setTitle] = useState('');
  const [badge, setBadge] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [specInput, setSpecInput] = useState('');
  const [specs, setSpecs] = useState<string[]>([]);
  const [components, setComponents] = useState<{ name: string; role: string; details: string }[]>([]);
  const [newCompName, setNewCompName] = useState('');
  const [newCompRole, setNewCompRole] = useState('');
  const [newCompDetails, setNewCompDetails] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingDesign) {
      setTitle(existingDesign.title);
      setBadge(existingDesign.badge || 'Architecture Blueprint');
      setDescription(existingDesign.description);
      setImageUrl(existingDesign.imageUrl);
      setSpecs(existingDesign.detailedSpecs || []);
      setComponents(existingDesign.components || []);
    } else {
      setTitle('');
      setBadge('Architecture Blueprint');
      setDescription('');
      setImageUrl(platform?.imageUrl || '/assets/images/avs_architecture_showcase_1791541766807.jpg');
      setSpecs([
        'Sub-millisecond line-rate latency across interconnected endpoints',
        'Automatic failover convergence with redundant secondary path',
        'High-density MTU 9000 jumbo frames enabled across overlay network'
      ]);
      setComponents([
        { name: 'Gateway Controller', role: 'Edge Routing', details: 'Terminates dynamic BGP sessions and enforces transit policy.' },
        { name: 'Compute Node Cluster', role: 'Workload Execution', details: 'Bare-metal ESXi hypervisors running virtual machines.' }
      ]);
    }
  }, [existingDesign, platform]);

  if (!platformId || !platform) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };


  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');
    setImageUrl('');

    try {
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
        body: JSON.stringify({ prompt, userId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate architecture schematic');

      const imageSrc = data.imageUrl || `data:image/jpeg;base64,${data.image}`;
      setImageUrl(imageSrc);
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpec = () => {
    if (specInput.trim()) {
      setSpecs(prev => [...prev, specInput.trim()]);
      setSpecInput('');
    }
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddComponent = () => {
    if (newCompName.trim() && newCompRole.trim()) {
      setComponents(prev => [
        ...prev,
        {
          name: newCompName.trim(),
          role: newCompRole.trim(),
          details: newCompDetails.trim() || 'Core architectural component.'
        }
      ]);
      setNewCompName('');
      setNewCompRole('');
      setNewCompDetails('');
    }
  };

  const handleRemoveComponent = (idx: number) => {
    setComponents(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim() || !description.trim()) return;

    const designPayload: ArchitectureDesignItem = {
      id: existingDesignId || `design-${Date.now()}`,
      title: title.trim(),
      badge: badge.trim() || 'Architecture Blueprint',
      imageUrl: imageUrl.trim(),
      description: description.trim(),
      detailedSpecs: specs,
      components: components
    };

    if (existingDesignId) {
      updatePlatformDesign(platformId, existingDesignId, designPayload);
    } else {
      addPlatformDesign(platformId, designPayload);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const presetImages = [
    { label: 'HCX Service Mesh', url: '/assets/images/hcx_architecture_showcase_1791544913309.jpg' },
    { label: 'SRM Replication & Test Bubble', url: '/assets/images/srm_architecture_showcase_1791544923913.jpg' },
    { label: 'AVS FastPath Architecture', url: '/assets/images/avs_architecture_showcase_1791541766807.jpg' },
    { label: 'GCVE PSA SDDC', url: '/assets/images/gcve_architecture_showcase_1791541780539.jpg' },
    { label: 'VMC Multi-AZ Stretched', url: '/assets/images/vmc_aws_migration_dr_showcase_1791541789539.jpg' },
    { label: 'NSX Zero-Trust DFW', url: '/assets/images/nsx_microsegmentation_showcase_1791541799407.jpg' },
    { label: 'Cloud Mesh Infrastructure', url: '/assets/images/architecture_avs_mesh_1791450083586.jpg' }
  ];

return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {existingDesignId ? 'Edit Architectural Design' : 'Add New Architecture Design'}
              </h3>
              <p className="text-xs text-slate-400">
                {platform.platform} · Attach high-res diagram & deep description
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Design Title & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300">Design Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Multi-AZ Stretched Cluster & Witness Arbitration"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Badge Label</label>
              <input
                type="text"
                value={badge}
                onChange={e => setBadge(e.target.value)}
                placeholder="e.g. Zero-RPO DR"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Diagram Image & Upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Diagram Image *</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="Image file path or generated URL"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 border border-slate-700"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload</span>
              </button>
              
              {/* AI Generate Button */}
              <button
                type="button"
                onClick={() => handleGenerateImage(title || 'Enterprise cloud architecture topology')}
                disabled={loading || !title.trim()}
                className="px-3.5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shrink-0 border border-cyan-400 transition-all shadow-md"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>AI Generate</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Preset Selector */}
            <div className="pt-1">
              <span className="text-[11px] text-slate-500 font-medium block mb-1.5">
                Quick Select Verified Technical Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {presetImages.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`px-2 py-1 rounded text-[11px] border transition-colors ${
                      imageUrl === preset.url
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Preview Box */}
            {imageUrl && (
              <div className="mt-2 relative aspect-video max-h-48 rounded-xl overflow-hidden border border-slate-800 bg-black">
                <img
                  src={imageUrl}
                  alt="Design Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>

          {/* Detailed Architectural Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              Architectural Description of this Specific Design *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide a comprehensive technical description explaining data paths, packet flows, high availability behaviors, and failure domains..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Technical Specifications */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Key Technical Specifications & Parameters
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={specInput}
                onChange={e => setSpecInput(e.target.value)}
                placeholder="e.g. MTU 9000, 10Gbps direct peering, sub-2ms RTT latency boundary"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSpec();
                  }
                }}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={handleAddSpec}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
            <div className="space-y-1.5 pt-1">
              {specs.map((spec, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-300"
                >
                  <span className="truncate pr-2">{spec}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    className="text-slate-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Component Inventory */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Architectural Components (Optional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Component Name"
                value={newCompName}
                onChange={e => setNewCompName(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Role / Function"
                value={newCompRole}
                onChange={e => setNewCompRole(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
              />
              <button
                type="button"
                onClick={handleAddComponent}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg p-2 text-xs font-semibold flex items-center justify-center gap-1 border border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Component</span>
              </button>
            </div>
            <div className="space-y-1.5 pt-1">
              {components.map((comp, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-xs"
                >
                  <div>
                    <span className="font-bold text-white">{comp.name}</span>
                    <span className="text-slate-500 mx-1.5">·</span>
                    <span className="text-cyan-400 font-mono text-[11px]">{comp.role}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveComponent(idx)}
                    className="text-slate-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savedSuccess}
              className="px-5 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-800" />
                  <span>Design Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{existingDesignId ? 'Save Changes' : 'Create Architecture Design'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};