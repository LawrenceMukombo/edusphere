import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '../src/server/db';
import { ChatService } from '../src/server/services/chat.service';

describe('NWUCHAS Enterprise Real-Time Campus Chat (WhatsApp Suite)', () => {
  let orgId: string;
  const mockUser = {
    id: 'usr-principal-test',
    name: 'Dr. Mwila Chileshe',
    role: 'INSTITUTION_ADMIN',
  };

  beforeAll(async () => {
    const org = await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } }) || await prisma.organisation.findFirst();
    if (!org) throw new Error('No organisation found.');
    orgId = org.id;
  });

  it('retrieves conversations list including clinical rotations group', async () => {
    const convs = await ChatService.getConversations(orgId);
    expect(Array.isArray(convs)).toBe(true);
    expect(convs.length).toBeGreaterThan(0);
    const clinicalGroup = convs.find((c) => c.id === 'conv-group-clinical');
    expect(clinicalGroup).toBeDefined();
    expect(clinicalGroup?.type).toBe('GROUP');
  });

  it('sends and persists a real chat message to a conversation thread in PostgreSQL', async () => {
    const msgText = 'Verified: Solwezi General Hospital PPE kits and clinical logs are fully prepared for the learners.';
    const sent = await ChatService.sendMessage(orgId, mockUser, {
      conversationId: 'conv-group-clinical',
      text: msgText,
      attachmentName: 'Solwezi_Clinical_Verification.pdf',
    });

    expect(sent.id).toBeDefined();
    expect(sent.text).toBe(msgText);
    expect(sent.senderName).toBe('Dr. Mwila Chileshe');
    expect(sent.attachmentName).toBe('Solwezi_Clinical_Verification.pdf');

    // Retrieve messages and ensure it persisted
    const threadMessages = await ChatService.getMessages(orgId, 'conv-group-clinical');
    expect(threadMessages.some((m) => m.text === msgText)).toBe(true);
  });

  it('creates a new direct conversation with an instructor and saves initial message', async () => {
    const newConv = await ChatService.createConversation(orgId, mockUser, {
      title: 'Sr. Chilufya Banda',
      type: 'DIRECT',
      participantId: 'usr-chilufya-rn',
      participantName: 'Sr. Chilufya Banda',
      participantRole: 'Senior Clinical Instructor (RN)',
      department: 'Nursing & Midwifery',
      initialMessage: 'Good afternoon Sister, please verify the OSCE schedule.',
    });

    expect(newConv.id).toBeDefined();
    expect(newConv.title).toBe('Sr. Chilufya Banda');
    expect(newConv.type).toBe('DIRECT');
    expect(newConv.department).toBe('Nursing & Midwifery');

    // Verify it appears in conversations list
    const convs = await ChatService.getConversations(orgId);
    expect(convs.some((c) => c.id === newConv.id)).toBe(true);
  });

  it('marks conversation as read and resets unread counter', async () => {
    const success = await ChatService.markAsRead(orgId, 'conv-group-clinical');
    expect(success).toBe(true);

    const convs = await ChatService.getConversations(orgId);
    const clinicalGroup = convs.find((c) => c.id === 'conv-group-clinical');
    expect(clinicalGroup?.unreadCount).toBe(0);
  });
});
