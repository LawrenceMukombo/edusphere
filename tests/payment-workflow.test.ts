import { describe, expect, it } from 'vitest';
import {
  assertPaymentTransition,
  assertVerifiedCreditEvent,
  PaymentEventReplayGuard,
  PaymentWorkflowError,
  type PaymentIntentSnapshot,
  type VerifiedProviderEvent,
} from '../src/server/payments/workflow';

const intent: PaymentIntentSnapshot = {
  id: 'intent-1', amount: '1250.00', currency: 'ZMW', state: 'PROCESSING', expiresAt: '2026-12-31T23:59:59Z',
};

const event: VerifiedProviderEvent = {
  eventId: 'evt-1', providerTransactionId: 'provider-1', intentId: 'intent-1', amount: '1250', currency: 'ZMW',
  providerState: 'CONFIRMED', signatureVerified: true, backendVerified: true, receivedAt: '2026-06-01T10:00:00Z',
};

describe('payment confirmation workflow', () => {
  it('accepts only a signed and server-verified exact confirmation', () => {
    expect(() => assertVerifiedCreditEvent(intent, event, new Date('2026-06-01'))).not.toThrow();
  });

  it('rejects client-like, unsigned and mismatched confirmations', () => {
    expect(() => assertVerifiedCreditEvent(intent, { ...event, signatureVerified: false }, new Date('2026-06-01'))).toThrow(/unsigned/i);
    expect(() => assertVerifiedCreditEvent(intent, { ...event, backendVerified: false }, new Date('2026-06-01'))).toThrow(/server-side/i);
    expect(() => assertVerifiedCreditEvent(intent, { ...event, amount: '1249.99' }, new Date('2026-06-01'))).toThrow(/amount/i);
  });

  it('rejects duplicate provider event delivery', () => {
    const guard = new PaymentEventReplayGuard();
    guard.accept(event);
    expect(() => guard.accept(event)).toThrow(/duplicate/i);
  });

  it('does not permit finalisation directly from browser-facing creation states', () => {
    expect(() => assertPaymentTransition('CREATED', 'CONFIRMED')).toThrow(PaymentWorkflowError);
    expect(() => assertVerifiedCreditEvent({ ...intent, state: 'PENDING_AUTHORISATION' }, event, new Date('2026-06-01'))).toThrow(/not permitted/i);
  });
});
