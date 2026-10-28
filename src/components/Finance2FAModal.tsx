// src/components/Finance2FAModal.tsx
// Backwards-compatible proxy redirecting legacy callers to authentic TwoFactorChallengeModal
'use client';

import React from 'react';
import { TwoFactorChallengeModal } from '@/components/auth/TwoFactorChallengeModal';

interface Finance2FAModalProps {
  onSuccess?: () => void;
  actionTitle?: string;
}

export function Finance2FAModal({
  onSuccess,
}: Finance2FAModalProps) {
  return (
    <TwoFactorChallengeModal
      isOpen={true}
      targetModule="finance"
      onSuccess={() => {
        if (onSuccess) onSuccess();
      }}
      onCancel={() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/portal/executive';
        }
      }}
    />
  );
}
export default Finance2FAModal;
