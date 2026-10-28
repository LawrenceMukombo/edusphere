import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '../src/server/db';
import { ChatService } from '../src/server/services/chat.service';

describe('NWUCHAS Enterprise Real-Time Campus Messenger (NWU Pulse Suite)', () => {
  let orgId: string;
  const mockUser = {
    id: 'usr-principal-test',
    name: 'Dr. Mwila Chileshe',
    role: 'INSTITUTION_ADMIN',
  };

  beforeAll(async () => {
    const org = (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } })) || (await prisma.organisation.findFirst());
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

  it('deletes a message for everyone and persists the deleted tombstone', async () => {
    // Send a message to be deleted
    const sent = await ChatService.sendMessage(orgId, mockUser, {
      conversationId: 'conv-group-clinical',
      text: 'Draft announcement regarding clinical scrubs that was sent by mistake.',
    });

    const deleted = await ChatService.deleteMessage(
      orgId,
      mockUser.id,
      'conv-group-clinical',
      sent.id
    );

    expect(deleted).toBeDefined();
    expect(deleted?.isDeleted).toBe(true);
    expect(deleted?.text).toBe('🚫 This message was deleted');
    expect(deleted?.status).toBe('deleted');

    // Verify persisted in DB
    const thread = await ChatService.getMessages(orgId, 'conv-group-clinical');
    const msgInDb = thread.find((m) => m.id === sent.id);
    expect(msgInDb?.text).toBe('🚫 This message was deleted');
    expect(msgInDb?.isDeleted).toBe(true);
  });

  it('forwards a message to another conversation and attaches the isForwarded badge', async () => {
    // 1. Send source message
    const sourceMsg = await ChatService.sendMessage(orgId, mockUser, {
      conversationId: 'conv-group-clinical',
      text: 'Urgent: Ministry of Health statutory immunization protocol update for pediatric ward.',
      attachmentName: 'MOH_Pediatric_Immunization_2026.pdf',
    });

    // 2. Forward to Senate group
    const forwardedList = await ChatService.forwardMessage(orgId, mockUser, {
      messageId: sourceMsg.id,
      fromConversationId: 'conv-group-clinical',
      targetConversationIds: ['conv-group-senate'],
    });

    expect(forwardedList.length).toBe(1);
    expect(forwardedList[0].conversationId).toBe('conv-group-senate');
    expect(forwardedList[0].text).toBe(sourceMsg.text);
    expect(forwardedList[0].isForwarded).toBe(true);
    expect(forwardedList[0].attachmentName).toBe('MOH_Pediatric_Immunization_2026.pdf');

    // Verify it exists in senate thread
    const senateMessages = await ChatService.getMessages(orgId, 'conv-group-senate');
    expect(senateMessages.some((m) => m.id === forwardedList[0].id && m.isForwarded)).toBe(true);
  });

  it('adds and toggles emoji reactions on a message', async () => {
    const msg = await ChatService.sendMessage(orgId, mockUser, {
      conversationId: 'conv-group-clinical',
      text: 'Clinical ward rotation timetable approved by Executive Principal.',
    });

    // React with 👍
    const reacted = await ChatService.reactMessage(
      orgId,
      { id: mockUser.id, name: mockUser.name },
      'conv-group-clinical',
      msg.id,
      '👍'
    );

    expect(reacted).toBeDefined();
    expect(reacted?.reactions?.some((r) => r.emoji === '👍' && r.count === 1)).toBe(true);

    // React again to toggle off
    const toggledOff = await ChatService.reactMessage(
      orgId,
      { id: mockUser.id, name: mockUser.name },
      'conv-group-clinical',
      msg.id,
      '👍'
    );

    expect(toggledOff?.reactions?.some((r) => r.emoji === '👍')).toBe(false);
  });

  it('toggles star / bookmark state on a message', async () => {
    const msg = await ChatService.sendMessage(orgId, mockUser, {
      conversationId: 'conv-group-clinical',
      text: 'Important: OSCE examination rubric weighting criteria.',
    });

    const starred = await ChatService.toggleStarMessage(orgId, 'conv-group-clinical', msg.id);
    expect(starred?.isStarred).toBe(true);

    const unstarred = await ChatService.toggleStarMessage(orgId, 'conv-group-clinical', msg.id);
    expect(unstarred?.isStarred).toBe(false);
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
