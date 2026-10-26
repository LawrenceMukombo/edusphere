/** Payment orchestration rules. Ledger posting and replay persistence must use a DB transaction in the adapter layer. */
export const paymentIntentStates = [
  'CREATED',
  'PENDING_AUTHORISATION',
  'PROCESSING',
  'CONFIRMED',
  'FAILED',
  'EXPIRED',
  'REVERSED',
  'REFUNDED',
  'DISPUTED',
] as const;

export type PaymentIntentState = (typeof paymentIntentStates)[number];

export interface PaymentIntentSnapshot {
  id: string;
  amount: string;
  currency: string;
  state: PaymentIntentState;
  expiresAt: string;
}

export interface VerifiedProviderEvent {
  eventId: string;
  providerTransactionId: string;
  intentId: string;
  amount: string;
  currency: string;
  providerState: 'CONFIRMED' | 'FAILED' | 'REVERSED' | 'REFUNDED' | 'DISPUTED';
  signatureVerified: boolean;
  backendVerified: boolean;
  receivedAt: string;
}

export class PaymentWorkflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentWorkflowError';
  }
}

const allowedTransitions: Readonly<Record<PaymentIntentState, readonly PaymentIntentState[]>> = {
  CREATED: ['PENDING_AUTHORISATION', 'EXPIRED', 'FAILED'],
  PENDING_AUTHORISATION: ['PROCESSING', 'FAILED', 'EXPIRED'],
  PROCESSING: ['CONFIRMED', 'FAILED', 'EXPIRED', 'REVERSED', 'DISPUTED'],
  CONFIRMED: ['REVERSED', 'REFUNDED', 'DISPUTED'],
  FAILED: [],
  EXPIRED: [],
  REVERSED: [],
  REFUNDED: [],
  DISPUTED: [],
};

export function toPaymentIntentState(status: string): PaymentIntentState {
  switch (status) {
    case 'INITIATED':
    case 'PENDING_CUSTOMER':
      return 'PENDING_AUTHORISATION';
    case 'PENDING_PROVIDER':
      return 'PROCESSING';
    case 'CANCELLED':
      return 'FAILED';
    default:
      return status as PaymentIntentState;
  }
}

export function assertPaymentTransition(from: PaymentIntentState | string, to: PaymentIntentState | string): void {
  const normalizedFrom = toPaymentIntentState(from);
  const normalizedTo = toPaymentIntentState(to);
  if (!allowedTransitions[normalizedFrom]?.includes(normalizedTo)) {
    throw new PaymentWorkflowError(`Payment transition ${from} → ${to} is not permitted.`);
  }
}

function normalisedMoney(value: string): string {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) throw new PaymentWorkflowError('Payment amounts must be non-negative values with at most two decimals.');
  const [whole, fraction = ''] = value.split('.');
  return `${BigInt(whole)}.${(fraction + '00').slice(0, 2)}`;
}

/** Validates an event before a ledger transaction can be attempted. */
export function assertVerifiedCreditEvent(intent: PaymentIntentSnapshot, event: VerifiedProviderEvent, now = new Date()): void {
  if (!event.signatureVerified) throw new PaymentWorkflowError('Unsigned provider event cannot credit an account.');
  if (!event.backendVerified) throw new PaymentWorkflowError('Provider transaction must be verified server-side before crediting.');
  if (event.providerState !== 'CONFIRMED') throw new PaymentWorkflowError('Only confirmed provider events can credit an account.');
  if (event.intentId !== intent.id) throw new PaymentWorkflowError('Provider event does not match the payment intent.');
  if (event.currency !== intent.currency) throw new PaymentWorkflowError('Provider event currency does not match the payment intent.');
  if (normalisedMoney(event.amount) !== normalisedMoney(intent.amount)) {
    throw new PaymentWorkflowError('Provider event amount does not match the payment intent.');
  }
  if (Date.parse(intent.expiresAt) < now.getTime()) throw new PaymentWorkflowError('Expired payment intent cannot be credited automatically.');
  assertPaymentTransition(intent.state, 'CONFIRMED');
}

/**
 * Testable replay guard. Production handlers must implement the same uniqueness
 * constraint using `webhook_inbox.event_id` inside the posting transaction.
 */
export class PaymentEventReplayGuard {
  private readonly processedEventIds = new Set<string>();

  accept(event: VerifiedProviderEvent): void {
    if (!event.eventId.trim()) throw new PaymentWorkflowError('Provider event ID is required for idempotency.');
    if (this.processedEventIds.has(event.eventId)) {
      throw new PaymentWorkflowError('Duplicate provider event detected.');
    }
    this.processedEventIds.add(event.eventId);
  }
}
