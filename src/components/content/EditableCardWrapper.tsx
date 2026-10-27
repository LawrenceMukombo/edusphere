'use client';

import React, { useState } from 'react';
import { Edit3, Sparkles } from 'lucide-react';
import { ContentCardItem } from '@/lib/contentCards';
import { EditCardModal } from './EditCardModal';

interface EditableCardWrapperProps {
  card: ContentCardItem;
  canEdit?: boolean;
  isEditMode?: boolean;
  onCardUpdated?: (updated: ContentCardItem) => void;
  children: React.ReactNode;
  className?: string;
}

export function EditableCardWrapper({
  card,
  canEdit = false,
  isEditMode = false,
  onCardUpdated,
  children,
  className = '',
}: EditableCardWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState<ContentCardItem>(card);

  // Keep currentCard updated if props change
  React.useEffect(() => {
    setCurrentCard(card);
  }, [card]);

  function handleSaved(updated: ContentCardItem) {
    setCurrentCard(updated);
    if (onCardUpdated) onCardUpdated(updated);
  }

  function handleReset(defaultCard: ContentCardItem) {
    setCurrentCard(defaultCard);
    if (onCardUpdated) onCardUpdated(defaultCard);
  }

  // If edit mode is not active or user cannot edit, render pure children
  if (!canEdit || !isEditMode) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Visual edit border indicator on hover */}
      <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-sky-400/0 group-hover:border-sky-500/80 transition-all pointer-events-none z-20 shadow-xs" />

      {/* Floating Edit Button */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="absolute top-3 right-3 z-30 inline-flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold px-2.5 py-1.5 shadow-md shadow-sky-600/30 opacity-90 group-hover:opacity-100 transition-all cursor-pointer transform group-hover:scale-105"
        title={`Edit "${currentCard.title}"`}
      >
        <Edit3 className="h-3.5 w-3.5" />
        <span>Edit Card</span>
      </button>

      {/* Card Content */}
      {children}

      {/* Edit Modal */}
      <EditCardModal
        card={currentCard}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
        onReset={handleReset}
      />
    </div>
  );
}
