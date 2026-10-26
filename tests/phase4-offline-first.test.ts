// tests/phase4-offline-first.test.ts
// Phase 4 Gate: Genuine Offline-First Capability, PWA Manifest, and Service Worker Safety
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  OFFLINE_ELIGIBILITY_POLICY,
  enqueueOfflineMutation,
  getPendingMutations,
  removePendingMutation,
} from '../src/lib/offlineSync';

describe('Phase 4: Genuine Offline-First Architecture & Safety Contract', () => {
  it('PWA Manifest identifies NWUCHAS CMIS with tertiary health shortcuts and brand accent', () => {
    const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
    const content = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    expect(content.name).toContain('North Western University College of Health and Applied Sciences');
    expect(content.short_name).toBe('NWUCHAS CMIS');
    expect(content.theme_color).toBe('#1a6bd6');
    expect(content.categories).toContain('health-sciences');
    expect(content.description).not.toContain('Legacy School');
  });

  it('Service Worker deletes the unacceptable trap returning synthetic 200 for failed mutations', () => {
    const swPath = path.join(process.cwd(), 'public', 'sw.js');
    const swCode = fs.readFileSync(swPath, 'utf8');

    // Must NOT return fake 200 success for failed mutations
    expect(swCode).not.toContain("status: 200,\n            headers: { 'Content-Type': 'application/json' },");
    expect(swCode).not.toContain('Recorded offline in local cache. Will sync automatically');

    // Must NOT broadly cache authenticated /api/* endpoints
    expect(swCode).not.toContain("caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, networkResponse))");
    expect(swCode).toContain('NWUCHAS CMIS Production Service Worker');
    expect(swCode).toContain('offline.html');
  });

  it('Offline Eligibility Policy strictly prohibits financial, payroll, and release operations offline', () => {
    expect(OFFLINE_ELIGIBILITY_POLICY.PERMITTED_OFFLINE).toContain('CAPTURE_ATTENDANCE');
    expect(OFFLINE_ELIGIBILITY_POLICY.PERMITTED_OFFLINE).toContain('DRAFT_CLINICAL_LOGBOOK');
    expect(OFFLINE_ELIGIBILITY_POLICY.PERMITTED_OFFLINE).toContain('RECORD_HOSTEL_ROLLCALL');

    expect(OFFLINE_ELIGIBILITY_POLICY.ONLINE_ONLY).toContain('MOBILE_MONEY_PAYMENT');
    expect(OFFLINE_ELIGIBILITY_POLICY.ONLINE_ONLY).toContain('SETTLE_FEE');
    expect(OFFLINE_ELIGIBILITY_POLICY.ONLINE_ONLY).toContain('PROCESS_PAYROLL');
    expect(OFFLINE_ELIGIBILITY_POLICY.ONLINE_ONLY).toContain('RELEASE_RESULTS');
    expect(OFFLINE_ELIGIBILITY_POLICY.ONLINE_ONLY).toContain('CREATE_USER');
  });

  it('Enqueuing a prohibited operation offline throws an explicit policy violation error', () => {
    expect(() => {
      enqueueOfflineMutation('MOBILE_MONEY_PAYMENT', 'FINANCE' as any, { amountZMW: 1500 });
    }).toThrow(/designated ONLINE-ONLY under NWUCHAS CMIS offline policy/);

    expect(() => {
      enqueueOfflineMutation('SETTLE_FEE', 'FINANCE' as any, { invoiceId: 'inv-123' });
    }).toThrow(/cannot be queued offline/);
  });

  it('Permitted offline commands generate immutable operation IDs, idempotency keys, and correlation IDs', () => {
    const cmd = enqueueOfflineMutation('CAPTURE_ATTENDANCE', 'ATTENDANCE', {
      sessionId: 'sess-001',
      records: [{ learnerId: 'lrn-001', status: 'PRESENT' }],
    });

    expect(cmd.operationId).toMatch(/^NWU-OP-\d+-\d+$/);
    expect(cmd.idempotencyKey).toBe(`IDEMP-${cmd.operationId}`);
    expect(cmd.correlationId).toMatch(/^CORR-\d+-\d+$/);
    expect(cmd.status).toBe('QUEUED');
    expect(cmd.retryCount).toBe(0);
    expect(cmd.maxRetries).toBe(5);

    // Verify retrieval and removal
    const pending = getPendingMutations();
    expect(pending.some((p) => p.operationId === cmd.operationId)).toBe(true);

    removePendingMutation(cmd.operationId);
    const afterRemoval = getPendingMutations();
    expect(afterRemoval.some((p) => p.operationId === cmd.operationId)).toBe(false);
  });

  it('Offline fallback page provides honest operating guidance and NWUCHAS identity', () => {
    const offlineHtmlPath = path.join(process.cwd(), 'public', 'offline.html');
    const html = fs.readFileSync(offlineHtmlPath, 'utf8');

    expect(html).toContain('Offline Mode • NWUCHAS CMIS');
    expect(html).toContain('North Western University College of Health and Applied Sciences');
    expect(html).toContain('Offline Operating Policy');
    expect(html).not.toContain('Legacy School Solwezi');
    expect(html).not.toContain('EduSphere');
  });
});
