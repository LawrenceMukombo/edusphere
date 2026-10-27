'use client';

import React, { useState } from 'react';
import { X, Save, RotateCcw, Sparkles, Check, AlertCircle, Plus, Trash2, Eye } from 'lucide-react';
import { ContentCardItem } from '@/lib/contentCards';

interface EditCardModalProps {
  card: ContentCardItem;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updatedCard: ContentCardItem) => void;
  onReset: (defaultCard: ContentCardItem) => void;
}

export function EditCardModal({
  card,
  isOpen,
  onClose,
  onSaved,
  onReset,
}: EditCardModalProps) {
  if (!isOpen) return null;

  const [title, setTitle] = useState(card.title || '');
  const [subtitle, setSubtitle] = useState(card.subtitle || '');
  const [badge, setBadge] = useState(card.badge || '');
  const [body, setBody] = useState(card.body || '');
  const [ctaLabel, setCtaLabel] = useState(card.ctaLabel || '');
  const [ctaUrl, setCtaUrl] = useState(card.ctaUrl || '');
  const [items, setItems] = useState<string[]>(card.metadata?.items || []);
  const [newItemText, setNewItemText] = useState('');
  const [isPublished, setIsPublished] = useState(card.isPublished ?? true);

  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  function addItem() {
    if (!newItemText.trim()) return;
    setItems([...items, newItemText.trim()]);
    setNewItemText('');
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        pageKey: card.pageKey,
        sectionKey: card.sectionKey,
        cardKey: card.cardKey,
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        badge: badge.trim() || null,
        body: body.trim(),
        ctaLabel: ctaLabel.trim() || null,
        ctaUrl: ctaUrl.trim() || null,
        metadata: {
          ...card.metadata,
          items: items.filter((it) => it.trim().length > 0),
        },
        displayOrder: card.displayOrder ?? 0,
        isPublished,
      };

      const res = await fetch('/api/content/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setSaving(false);

      if (!res.ok) {
        setError(data.message || 'Failed to save card changes.');
        return;
      }

      setSuccess('Card changes saved and published successfully!');
      onSaved({
        ...card,
        title: payload.title,
        subtitle: payload.subtitle || undefined,
        badge: payload.badge || undefined,
        body: payload.body,
        ctaLabel: payload.ctaLabel || undefined,
        ctaUrl: payload.ctaUrl || undefined,
        metadata: payload.metadata,
        isPublished: payload.isPublished,
      });

      setTimeout(() => {
        onClose();
      }, 700);
    } catch {
      setSaving(false);
      setError('Network communication failed while saving card.');
    }
  }

  async function handleReset() {
    if (!confirm('Revert this card to its statutory college default content? All custom edits will be cleared.')) {
      return;
    }

    setResetting(true);
    setError('');

    try {
      const res = await fetch('/api/content/cards', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageKey: card.pageKey,
          sectionKey: card.sectionKey,
          cardKey: card.cardKey,
        }),
      });

      const data = await res.json();
      setResetting(false);

      if (!res.ok) {
        setError(data.message || 'Failed to reset card.');
        return;
      }

      setSuccess('Card reverted to statutory default!');
      onReset(data.data);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch {
      setResetting(false);
      setError('Network communication failed while resetting card.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl text-slate-800 my-8 overflow-hidden animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-[#0b2545] to-[#123e75] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#8DC63F]/20 text-[#8DC63F] border border-[#8DC63F]/40 font-bold">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Edit Institutional Content Card</h2>
              <div className="flex items-center gap-2 text-xs text-blue-200 font-mono">
                <span>Section: {card.sectionKey}</span>
                <span>•</span>
                <span>Key: {card.cardKey}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'editor' ? 'preview' : 'editor')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs px-3 py-1.5 text-white transition cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              {activeTab === 'editor' ? 'Live Preview' : 'Back to Editor'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-lime-200 bg-lime-50 p-3 text-xs text-lime-800 font-medium">
            <Check className="h-4 w-4 shrink-0 text-lime-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Modal Body: Editor vs Preview */}
        {activeTab === 'preview' ? (
          <div className="p-6 bg-slate-50 min-h-[350px]">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                {badge && (
                  <span className="rounded-md bg-[#8DC63F]/15 text-[#5c8426] border border-[#8DC63F]/40 text-xs font-bold px-2.5 py-1">
                    {badge}
                  </span>
                )}
                {subtitle && <span className="text-xs font-semibold text-slate-500">{subtitle}</span>}
              </div>
              <h3 className="text-xl font-bold text-[#0b2545]">{title || 'Untitled Card'}</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{body || 'No description provided.'}</p>

              {items.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-1 text-xs">
                  <div className="font-bold text-slate-700">Highlights / Details:</div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    {items.map((it, idx) => (
                      <li key={idx}>{it}</li>
                    ))}
                  </ul>
                </div>
              )}

              {ctaLabel && (
                <div className="pt-4 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#007B99] text-white px-4 py-2 text-xs font-bold shadow-xs">
                    {ctaLabel} →
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Card Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#007B99] focus:ring-1 focus:ring-[#007B99] outline-hidden font-semibold"
                placeholder="e.g. Diploma in Registered Nursing (RN)"
              />
            </div>

            {/* Subtitle & Badge Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-[#007B99] focus:ring-1 focus:ring-[#007B99] outline-hidden"
                  placeholder="e.g. 3 Years • Full Time"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Badge / Accreditation</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-[#007B99] focus:ring-1 focus:ring-[#007B99] outline-hidden"
                  placeholder="e.g. NMCZ Accredited"
                />
              </div>
            </div>

            {/* Body Text */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Body Description *</label>
              <textarea
                required
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-[#007B99] focus:ring-1 focus:ring-[#007B99] outline-hidden leading-relaxed"
                placeholder="Detailed text describing the card content, curricula, requirements, or institutional guidance..."
              />
            </div>

            {/* CTA Label & Link */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Call to Action Button Label</label>
                <input
                  type="text"
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-[#007B99] focus:ring-1 focus:ring-[#007B99] outline-hidden"
                  placeholder="e.g. Apply Online Now"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Button Link URL / Anchor</label>
                <input
                  type="text"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-[#007B99] focus:ring-1 focus:ring-[#007B99] outline-hidden"
                  placeholder="e.g. /apply or #programmes"
                />
              </div>
            </div>

            {/* Key Items / Bullet Points List */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Key Bullet Points / Highlights
              </label>

              {items.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs text-slate-700"
                    >
                      <span className="truncate">{item}</span>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-slate-400 hover:text-rose-600 transition shrink-0 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem();
                    }
                  }}
                  placeholder="Add bullet point or key fact..."
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-[#007B99] outline-hidden"
                />
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1.5 text-xs font-bold transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
            </div>

            {/* Publication Status */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#007B99] focus:ring-[#007B99]"
                />
                <span>Published on Public Portal</span>
              </label>

              <button
                type="button"
                onClick={handleReset}
                disabled={resetting}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 transition cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {resetting ? 'Resetting...' : 'Revert to College Default'}
              </button>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#007B99] hover:bg-[#00627a] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving Changes...' : 'Save & Publish Card'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
