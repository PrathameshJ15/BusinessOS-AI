'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Globe,
  Smartphone,
  Monitor,
  Sparkles,
  Edit3,
  ExternalLink,
  CheckCircle2,
  Lock,
  Layers,
  Palette,
  Eye,
  Scissors,
  Heart,
  Star,
} from 'lucide-react';

export default function WebsitePage() {
  const { website, updateWebsiteBlock, publishWebsiteToggle, canAccess } = useApp();
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedBlockId, setSelectedBlockId] = useState<string>('blk-1');

  const currentPage = website.pages[0];
  const selectedBlock = currentPage.blocks.find((b) => b.id === selectedBlockId) || currentPage.blocks[0];

  const [titleInput, setTitleInput] = useState(selectedBlock.title);
  const [subtitleInput, setSubtitleInput] = useState(selectedBlock.subtitle || '');

  const handleBlockUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateWebsiteBlock(selectedBlockId, {
      title: titleInput,
      subtitle: subtitleInput,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Website Builder & Hosting</h1>
          <p className="text-xs text-slate-500 mt-1">Live section editor with instant responsive previews & 1-click custom domain publishing.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-2 rounded-lg text-xs font-medium transition-all ${
                previewDevice === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-2 rounded-lg text-xs font-medium transition-all ${
                previewDevice === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {canAccess('website:write') ? (
            <button
              onClick={publishWebsiteToggle}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow flex items-center gap-2 ${
                website.isPublished
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>{website.isPublished ? 'Live on Web (Click to Unpublish)' : 'Publish Website'}</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400 font-mono px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
              Role: Restricted (Read Only)
            </span>
          )}
        </div>
      </div>

      {/* Domain Status Info Card */}
      <div className="bg-slate-900 p-4 rounded-2xl text-white border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Domain Endpoint</span>
            <p className="text-sm font-bold text-white flex items-center gap-2">
              <span>https://{website.subdomain}.businessos.app</span>
              {website.isPublished && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                  LIVE
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Theme: <strong className="text-white">Apple Slate</strong></span>
          <span>•</span>
          <span>Font: <strong className="text-white">Inter</strong></span>
        </div>
      </div>

      {/* Editor & Preview Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section Selector & Block Inspector (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Page Section Blocks</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">3 Blocks</span>
            </div>

            <div className="space-y-2">
              {currentPage.blocks.map((block) => (
                <button
                  key={block.id}
                  onClick={() => {
                    setSelectedBlockId(block.id);
                    setTitleInput(block.title);
                    setSubtitleInput(block.subtitle || '');
                  }}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                    selectedBlockId === block.id
                      ? 'bg-blue-50/70 border-blue-300 text-blue-900 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 font-mono text-[10px] flex items-center justify-center font-bold">
                      {block.order}
                    </span>
                    <div>
                      <p className="font-semibold">{block.type} SECTION</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[170px]">{block.title}</p>
                    </div>
                  </div>
                  <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Block Editor Controls */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Edit Block Text</span>
            </h3>

            <form onSubmit={handleBlockUpdate} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Headline</label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle Description</label>
                <textarea
                  rows={3}
                  value={subtitleInput}
                  onChange={(e) => setSubtitleInput(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow"
              >
                Apply Text Changes
              </button>
            </form>
          </div>
        </div>

        {/* Right Live Responsive Preview Canvas (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center justify-center min-h-[500px]">
          <div className="text-xs text-slate-400 font-mono mb-4 flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>Interactive Live View ({previewDevice.toUpperCase()})</span>
          </div>

          <div
            className={`transition-all duration-300 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl ${
              previewDevice === 'desktop' ? 'w-full max-w-2xl' : 'w-[320px]'
            }`}
          >
            {/* Browser Top Chrome */}
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <div className="mx-auto text-[10px] text-slate-400 font-mono bg-slate-950 px-3 py-0.5 rounded-md border border-slate-800">
                https://{website.subdomain}.businessos.app
              </div>
            </div>

            {/* Generated Website Preview Content */}
            <div className="p-6 text-white space-y-8 bg-gradient-to-b from-slate-950 to-slate-900">
              {/* HERO BLOCK */}
              <div className="text-center py-6 space-y-3">
                <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">
                  Lumina Luxe Spa & Salon
                </div>
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight leading-snug">
                  {currentPage.blocks[0].title}
                </h1>
                <p className="text-xs text-slate-400 max-w-md mx-auto">{currentPage.blocks[0].subtitle}</p>
                <div className="pt-2">
                  <span className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20">
                    Book Appointment Now
                  </span>
                </div>
              </div>

              {/* SERVICES BLOCK */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h2 className="text-sm font-bold text-center text-slate-200">{currentPage.blocks[1].title}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                    <p className="font-bold text-white">Hydra-Facial & Glow</p>
                    <p className="text-[10px] text-slate-400">60 Mins • ₹3,500</p>
                  </div>
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                    <p className="font-bold text-white">Aromatherapy Massage</p>
                    <p className="text-[10px] text-slate-400">90 Mins • ₹4,500</p>
                  </div>
                </div>
              </div>

              {/* TESTIMONIALS BLOCK */}
              <div className="pt-4 border-t border-slate-800 space-y-2 text-center">
                <div className="flex items-center justify-center text-amber-400 gap-0.5 text-xs">
                  ★★★★★
                </div>
                <p className="text-xs italic text-slate-300">"{currentPage.blocks[2].subtitle}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
