import React from 'react';
import {
  Type,
  LayoutGrid,
  TrendingUp,
  Columns,
  Quote,
  Sparkles,
  Zap,
  Layers,
  Plus,
  Trash2,
  Sliders,
  Palette,
  Clock,
  Flame,
  Split,
  Image as ImageIcon,
} from 'lucide-react';
import type { VideoScene, SceneTemplateType, GalleryImageItem } from '../../types/remotion';
import { SCENE_TEMPLATES_CATALOG } from '../../data/sceneTemplates';

interface SceneCustomizerProps {
  scene: VideoScene;
  onUpdateScene: (updatedScene: VideoScene) => void;
  sceneIndex?: number;
  totalScenes?: number;
  onOpenTransitionsGallery?: () => void;
}

export const SceneCustomizer: React.FC<SceneCustomizerProps> = ({
  scene,
  onUpdateScene,
  sceneIndex,
  totalScenes,
  onOpenTransitionsGallery,
}) => {
  const updateField = <K extends keyof VideoScene>(field: K, value: VideoScene[K]) => {
    onUpdateScene({
      ...scene,
      [field]: value,
    });
  };

  const handleTemplateTypeChange = (newType: SceneTemplateType) => {
    const meta = SCENE_TEMPLATES_CATALOG.find((t) => t.type === newType);
    if (!meta) return;

    onUpdateScene({
      ...scene,
      templateType: newType,
      name: meta.title,
      // Seed default content if missing
      title: scene.title || meta.defaultContent.title || 'Judul Baru',
      subtitle: scene.subtitle || meta.defaultContent.subtitle,
      badgeText: scene.badgeText || meta.defaultContent.badgeText,
      items: scene.items && scene.items.length > 0 ? scene.items : (meta.defaultContent.items || ['Fitur 01', 'Fitur 02', 'Fitur 03']),
      metricNumber: scene.metricNumber || meta.defaultContent.metricNumber || '10x',
      metricLabel: scene.metricLabel || meta.defaultContent.metricLabel || 'Peningkatan Performa',
      ctaText: scene.ctaText || meta.defaultContent.ctaText || 'Mulai Sekarang',
      author: scene.author || meta.defaultContent.author || 'Budi Santoso',
      authorRole: scene.authorRole || meta.defaultContent.authorRole || 'Lead Video Creator',
      beforeText: scene.beforeText || meta.defaultContent.beforeText || 'Cara lama lambat dan manual.',
      afterText: scene.afterText || meta.defaultContent.afterText || 'Cara baru otomatis dengan kode React.',
    });
  };

  const handleItemChange = (index: number, val: string) => {
    const items = [...(scene.items || ['Fitur 1', 'Fitur 2', 'Fitur 3'])];
    items[index] = val;
    updateField('items', items);
  };

  const handleAddItem = () => {
    const items = [...(scene.items || [])];
    if (items.length >= 4) return;
    items.push(`Poin Fitur #${items.length + 1}`);
    updateField('items', items);
  };

  const handleRemoveItem = (index: number) => {
    const items = (scene.items || []).filter((_, i) => i !== index);
    updateField('items', items);
  };

  return (
    <div className="space-y-4 text-xs select-none">
      {/* 1. Header info & Template Selector */}
      <div className="p-3.5 rounded-xl bg-[#13151e] border border-[#262939] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            {sceneIndex !== undefined ? `Scene #${sceneIndex + 1} dari ${totalScenes || 1}` : 'Konfigurasi Scene'}
          </span>
          <span className="font-mono text-[11px] text-slate-300 bg-[#1c1f2c] px-2 py-0.5 rounded border border-[#2d3144]">
            {scene.durationInFrames} frames ({(scene.durationInFrames / 30).toFixed(1)}s)
          </span>
        </div>

        {/* Change Template Dropdown */}
        <div>
          <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
            Ganti Jenis Template Adegan:
          </label>
          <select
            value={scene.templateType}
            onChange={(e) => handleTemplateTypeChange(e.target.value as SceneTemplateType)}
            className="w-full bg-[#1b1d28] border border-[#2b3042] focus:border-cyan-500 rounded-xl p-2.5 text-slate-100 font-semibold text-xs focus:outline-none cursor-pointer"
          >
            {SCENE_TEMPLATES_CATALOG.map((tmpl) => (
              <option key={tmpl.type} value={tmpl.type}>
                {tmpl.title} ({tmpl.category})
              </option>
            ))}
          </select>
        </div>

        {/* Scene Display Name */}
        <div>
          <label className="block text-[10px] text-slate-400 font-medium mb-1">
            Label Scene di Timeline:
          </label>
          <input
            type="text"
            value={scene.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full bg-[#181a24] border border-[#282c3c] focus:border-cyan-500 rounded-lg p-2 text-slate-200 text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* 2. Primary Text Fields (Headline / Title / Subtitle / Badge) */}
      <div className="p-3.5 rounded-xl bg-[#13151e] border border-[#262939] space-y-3">
        <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 text-cyan-300">
          <Type className="w-3.5 h-3.5" />
          <span>Kustomisasi Teks & Tipografi</span>
        </h4>

        {/* Badge Text */}
        <div>
          <label className="block text-[10px] text-slate-400 font-semibold mb-1">
            Teks Badge / Tag (Pill di atas judul):
          </label>
          <input
            type="text"
            value={scene.badgeText || ''}
            onChange={(e) => updateField('badgeText', e.target.value)}
            placeholder="Contoh: FITUR TERBARU 2026, PROMO 11.11, TIPS..."
            className="w-full bg-[#181a24] border border-[#282c3c] focus:border-cyan-500 rounded-lg p-2 text-slate-200 text-xs focus:outline-none"
          />
        </div>

        {/* Main Title / Headline */}
        <div>
          <label className="block text-[10px] text-slate-400 font-semibold mb-1">
            Judul Utama (Kinetic Headline):
          </label>
          <textarea
            rows={2}
            value={scene.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Ketik judul utama adegan di sini..."
            className="w-full bg-[#181a24] border border-[#282c3c] focus:border-cyan-500 rounded-lg p-2.5 text-slate-100 font-semibold text-xs focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-[10px] text-slate-400 font-semibold mb-1">
            Subheadline / Penjelas:
          </label>
          <textarea
            rows={2}
            value={scene.subtitle || ''}
            onChange={(e) => updateField('subtitle', e.target.value)}
            placeholder="Ketik kalimat subteks penjelas..."
            className="w-full bg-[#181a24] border border-[#282c3c] focus:border-cyan-500 rounded-lg p-2.5 text-slate-200 text-xs focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* 3. Template-Specific Fields */}
      {/* A. Feature Grid / Product Showcase Items */}
      {(scene.templateType === 'feature-grid' || scene.templateType === 'product-showcase') && (
        <div className="p-3.5 rounded-xl bg-[#13151e] border border-[#262939] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 text-cyan-300">
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Daftar Kartu Fitur ({scene.items?.length || 0}/4)</span>
            </h4>
            {(scene.items?.length || 0) < 4 && (
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 hover:bg-cyan-900 border border-cyan-800 text-[10px] font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            {(scene.items || ['Fitur 1', 'Fitur 2', 'Fitur 3']).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-cyan-400 bg-[#1a1c27] px-2 py-1.5 rounded border border-[#2b2f42] shrink-0">
                  0{idx + 1}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleItemChange(idx, e.target.value)}
                  placeholder={`Fitur ${idx + 1}...`}
                  className="flex-1 bg-[#181a24] border border-[#282c3c] focus:border-cyan-500 rounded-lg p-2 text-slate-200 text-xs focus:outline-none"
                />
                {(scene.items?.length || 0) > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-2 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-950/40 transition-colors"
                    title="Hapus poin ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* A2. Image Gallery Fields */}
      {scene.templateType === 'image-gallery' && (
        <div className="p-3.5 rounded-xl bg-[#13151e] border border-[#262939] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 text-purple-400">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Kartu Galeri Foto ({scene.galleryImages?.length || 4}/4)</span>
            </h4>
          </div>

          <div className="space-y-2">
            {(scene.galleryImages || [
              { id: '1', title: 'Hologram 3D', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', tag: 'DESIGN' },
              { id: '2', title: 'Cyber Rig', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', tag: 'TECH' },
              { id: '3', title: 'Prism Spectrum', url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80', tag: 'STYLE' },
            ]).map((img, idx) => (
              <div key={img.id || idx} className="p-2 rounded-lg bg-[#181a24] border border-[#272b3b] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-400">Foto #{idx + 1}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300">
                    {img.tag || 'MEDIA'}
                  </span>
                </div>
                <input
                  type="text"
                  value={img.title}
                  onChange={(e) => {
                    const current = [...(scene.galleryImages || [])];
                    if (current[idx]) {
                      current[idx] = { ...current[idx], title: e.target.value };
                      updateField('galleryImages', current);
                    }
                  }}
                  placeholder="Judul Foto..."
                  className="w-full bg-[#11131c] border border-[#232636] rounded px-2 py-1 text-xs text-white"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* B. Metric Impact Fields */}
      {scene.templateType === 'metric-impact' && (
        <div className="p-3.5 rounded-xl bg-[#13151e] border border-[#262939] space-y-3">
          <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Kustomisasi Angka Metrik</span>
          </h4>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                Angka / Nilai:
              </label>
              <input
                type="text"
                value={scene.metricNumber || ''}
                onChange={(e) => updateField('metricNumber', e.target.value)}
                placeholder="10x, 95%, $10M, 100K..."
                className="w-full bg-[#181a24] border border-[#282c3c] focus:border-emerald-500 rounded-lg p-2 text-emerald-300 font-mono font-bold text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                Label Metrik:
              </label>
              <input
                type="text"
                value={scene.metricLabel || ''}
                onChange={(e) => updateField('metricLabel', e.target.value)}
                placeholder="Efisiensi Render, Kepuasan Klien..."
                className="w-full bg-[#181a24] border border-[#282c3c] focus:border-emerald-500 rounded-lg p-2 text-slate-200 text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* C. Split Comparison Fields */}
      {scene.templateType === 'split-comparison' && (
        <div className="p-3.5 rounded-xl bg-[#13151e] border border-[#262939] space-y-3">
          <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 text-amber-400">
            <Columns className="w-3.5 h-3.5" />
            <span>Kustomisasi Komparasi (Before vs After)</span>
          </h4>

          <div>
            <label className="block text-[10px] text-rose-400 font-semibold mb-1">
              ✕ Teks Cara Lama (Masalah / Sebelum):
            </label>
            <textarea
              rows={2}
              value={scene.beforeText || ''}
              onChange={(e) => updateField('beforeText', e.target.value)}
              placeholder="Cara lama manual, lambat, dan membuang waktu..."
              className="w-full bg-[#1e1315] border border-rose-900/60 focus:border-rose-500 rounded-lg p-2 text-slate-200 text-xs focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] text-emerald-400 font-semibold mb-1">
              ✓ Teks Cara Baru (Solusi Remotion / Sesudah):
            </label>
            <textarea
              rows={2}
              value={scene.afterText || ''}
              onChange={(e) => updateField('afterText', e.target.value)}
              placeholder="Cara Remotion: Sekali klik kode React, ratusan video selesai otomatis!"
              className="w-full bg-[#111e18] border border-emerald-900/60 focus:border-emerald-500 rounded-lg p-2 text-slate-200 text-xs focus:outline-none resize-none"
            />
          </div>
        </div>
      )}

      {/* D. Quote Testimonial Fields */}
      {scene.templateType === 'quote-testimonial' && (
        <div className="p-3.5 rounded-xl bg-[#13151e] border border-[#262939] space-y-3">
          <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 text-purple-400">
            <Quote className="w-3.5 h-3.5" />
            <span>Kustomisasi Testimoni & Kredensial</span>
          </h4>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                Nama Pembicara:
              </label>
              <input
                type="text"
                value={scene.author || ''}
                onChange={(e) => updateField('author', e.target.value)}
                placeholder="Budi Santoso..."
                className="w-full bg-[#181a24] border border-[#282c3c] focus:border-purple-500 rounded-lg p-2 text-slate-200 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                Jabatan / Perusahaan:
              </label>
              <input
                type="text"
                value={scene.authorRole || ''}
                onChange={(e) => updateField('authorRole', e.target.value)}
                placeholder="Head of Growth..."
                className="w-full bg-[#181a24] border border-[#282c3c] focus:border-purple-500 rounded-lg p-2 text-slate-200 text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* E. Outro & Call to Action Fields */}
      {scene.templateType === 'outro-cta' && (
        <div className="p-3.5 rounded-xl bg-[#13151e] border border-[#262939] space-y-3">
          <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 text-teal-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kustomisasi Call to Action (CTA) & Brand</span>
          </h4>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                Nama Brand / Channel:
              </label>
              <input
                type="text"
                value={scene.brandName || ''}
                onChange={(e) => updateField('brandName', e.target.value)}
                placeholder="CloudVideo AI, DevHacks..."
                className="w-full bg-[#181a24] border border-[#282c3c] focus:border-teal-500 rounded-lg p-2 text-slate-200 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                Teks Tombol CTA:
              </label>
              <input
                type="text"
                value={scene.ctaText || ''}
                onChange={(e) => updateField('ctaText', e.target.value)}
                placeholder="Coba Sekarang, Follow..."
                className="w-full bg-[#181a24] border border-[#282c3c] focus:border-teal-500 rounded-lg p-2 text-slate-200 text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. Durasi Frame Adegan */}
      <div className="p-3.5 rounded-xl bg-[#13151e] border border-[#262939] space-y-2.5">
        <div className="flex items-center justify-between text-slate-300">
          <span className="font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Durasi Adegan Ini
          </span>
          <span className="font-mono text-cyan-400 font-bold bg-[#181a24] px-2 py-0.5 rounded border border-cyan-800/40">
            {scene.durationInFrames} frames ({(scene.durationInFrames / 30).toFixed(1)} detik)
          </span>
        </div>

        <input
          type="range"
          min={30}
          max={300}
          step={15}
          value={scene.durationInFrames}
          onChange={(e) => updateField('durationInFrames', parseInt(e.target.value, 10))}
          className="w-full h-1.5 bg-[#252838] rounded appearance-none cursor-pointer accent-cyan-400"
        />

        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>1.0s (30f)</span>
          <span>3.0s (90f)</span>
          <span>10.0s (300f)</span>
        </div>
      </div>

      {/* 5. Transisi Keluar Adegan */}
      <div className="p-3.5 rounded-xl bg-[#13151e] border border-[#262939] space-y-2.5">
        <div className="flex items-center justify-between text-slate-300">
          <span className="font-semibold text-xs flex items-center gap-1.5">
            <Split className="w-3.5 h-3.5 text-cyan-400" />
            Transisi Keluar Adegan:
          </span>
          <span className="font-mono text-emerald-400 font-bold bg-[#181a24] px-2 py-0.5 rounded border border-emerald-800/40 text-[11px] uppercase">
            {scene.transitionNext?.type || 'fade'} ({scene.transitionNext?.durationInFrames || 15}f)
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          Efek perpindahan saat adegan ini berganti ke adegan berikutnya di timeline.
        </p>
        {onOpenTransitionsGallery && (
          <button
            type="button"
            onClick={onOpenTransitionsGallery}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500 hover:to-blue-500 text-cyan-300 hover:text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 border border-cyan-500/40 hover:border-transparent transition-all shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pilih di Galeri Transisi (Fade, Slide, Zoom, Wipe)</span>
          </button>
        )}
      </div>
    </div>
  );
};
