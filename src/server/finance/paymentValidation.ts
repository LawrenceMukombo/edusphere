export class FinanceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FinanceValidationError';
  }
}

/** Converts an API number into exact two-decimal ZMW text without accepting implicit rounding. */
export function moneyInputToFixed(value: number): string {
  if (!Number.isFinite(value) || value <= 0) throw new FinanceValidationError('Amount must be a positive finite value.');
  const ngwee = value * 100;
  if (!Number.isInteger(ngwee)) throw new FinanceValidationError('Amount must not contain more than two decimal places.');
  return (Math.round(ngwee) / 100).toFixed(2);
}

export function assertPaymentCapture(input: {
  amount: number;
  outstandingBalance: number;
  paymentNumber: string;
  receiptNumber: string;
  referenceNumber: string;
}): string {
  const amount = moneyInputToFixed(input.amount);
  if (!Number.isFinite(input.outstandingBalance) || input.outstandingBalance < 0) {
    throw new FinanceValidationError('Invoice balance is invalid.');
  }
  if (input.amount > input.outstandingBalance) {
    throw new FinanceValidationError('Payment amount exceeds the current invoice balance.');
  }
  if (!input.paymentNumber.trim() || !input.receiptNumber.trim() || !input.referenceNumber.trim()) {
    throw new FinanceValidationError('Payment, receipt and external reference numbers are required.');
  }
  return amount;
}
