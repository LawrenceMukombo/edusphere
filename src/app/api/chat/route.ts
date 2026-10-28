import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { extractSessionToken, verifyToken } from '@/server/auth';
import { ChatService, ChatMessage, ChatConversation } from '@/server/services/chat.service';

class UnauthorizedError extends Error {}

async function getAuthSession(headers: Headers) {
  const token = extractSessionToken(headers);
  const session = token ? verifyToken(token) : null;
  if (!session?.userId) {
    throw new UnauthorizedError('Your session has expired. Please sign in again.');
  }
  const org =
    (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } })) ||
    (await prisma.organisation.findFirst());
  const fullName = `${session.firstName || ''} ${session.lastName || ''}`.trim();
  return {
    orgId: session.organisationId || org?.id || 'nwuchas-main',
    userId: session.userId,
    name: fullName || session.email || 'Campus User',
    role: session.role || 'STAFF',
  };
}

function errorResponse(err: any) {
  if (err instanceof UnauthorizedError) {
    return NextResponse.json({ success: false, message: err.message, code: 'UNAUTHORIZED' }, { status: 401 });
  }
  const msg = String(err?.message || '');
  if (msg.startsWith('FORBIDDEN')) {
    return NextResponse.json(
      { success: false, message: msg.replace('FORBIDDEN: ', ''), code: 'FORBIDDEN' },
      { status: 403 }
    );
  }
  console.error('[Chat API] route error');
  return NextResponse.json(
    { success: false, message: 'Could not complete this request. Please try again.', code: 'CHAT_ERROR' },
    { status: 500 }
  );
}

// Attachment limits: images, PDFs, Office docs, plain text and recorded voice notes.
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
  'audio/mpeg',
];

export async function GET(request: Request) {
  try {
    const auth = await getAuthSession(request.headers);
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    const conversations = await ChatService.getConversations(auth.orgId);

    // If specific conversation messages requested:
    if (conversationId) {
      const messages = (await ChatService.getMessages(auth.orgId, conversationId)).filter(
        (m) => !(m.deletedFor || []).includes(auth.userId)
      );
      return NextResponse.json({
        success: true,
        data: {
          conversation: conversations.find((c) => c.id === conversationId) || null,
          messages,
        },
      });
    }

    // Return all conversations and directory of available staff to chat with
    const staffMembers = await prisma.staff.findMany({
      where: { organisationId: auth.orgId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        staffNumber: true,
        employmentStatus: true,
      },
      take: 25,
    });

    return NextResponse.json({
      success: true,
      data: {
        conversations,
        contacts: staffMembers.map((s) => ({
          id: s.id,
          name: `${s.firstName} ${s.lastName}`,
          role: s.jobTitle || 'Faculty Member',
          department: s.jobTitle.toLowerCase().includes('nurs')
            ? 'Nursing & Midwifery'
            : s.jobTitle.toLowerCase().includes('clin') || s.jobTitle.toLowerCase().includes('med')
            ? 'Clinical Medicine'
            : 'Academic Affairs',
          staffNumber: s.staffNumber,
          isOnline: true,
        })),
        currentUser: {
          id: auth.userId,
          name: auth.name,
          role: auth.role,
        },
      },
    });
  } catch (err: any) {
    return errorResponse(err);
  }
}

const sendMessageSchema = z.object({
  action: z.literal('SEND_MESSAGE'),
  conversationId: z.string().min(1),
  text: z.string().trim().min(1).max(5000),
  attachmentName: z.string().trim().max(255).optional(),
  attachmentUrl: z.string().optional(),
  attachmentType: z.string().max(120).optional(),
  attachmentSize: z.string().max(30).optional(),
  replyTo: z
    .object({
      id: z.string(),
      senderName: z.string(),
      text: z.string().max(500),
    })
    .optional(),
  isForwarded: z.boolean().optional(),
});

const editMessageSchema = z.object({
  action: z.literal('EDIT_MESSAGE'),
  conversationId: z.string().min(1),
  messageId: z.string().min(1),
  text: z.string().trim().min(1).max(5000),
});

const deleteMessageSchema = z.object({
  action: z.literal('DELETE_MESSAGE'),
  conversationId: z.string().min(1),
  messageId: z.string().min(1),
  scope: z.enum(['me', 'everyone']).default('everyone'),
});

const forwardMessageSchema = z.object({
  action: z.literal('FORWARD_MESSAGE'),
  messageId: z.string().min(1),
  fromConversationId: z.string().min(1),
  targetConversationIds: z.array(z.string().min(1)).min(1),
});

const reactMessageSchema = z.object({
  action: z.literal('REACT_MESSAGE'),
  conversationId: z.string().min(1),
  messageId: z.string().min(1),
  emoji: z.string().min(1).max(10),
});

const toggleStarSchema = z.object({
  action: z.literal('TOGGLE_STAR'),
  conversationId: z.string().min(1),
  messageId: z.string().min(1),
});

const createConversationSchema = z.object({
  action: z.literal('CREATE_CONVERSATION'),
  title: z.string().trim().min(1).max(200),
  type: z.enum(['DIRECT', 'GROUP']),
  participantId: z.string().optional(),
  participantName: z.string().optional(),
  participantRole: z.string().optional(),
  department: z.string().optional(),
  initialMessage: z.string().optional(),
});

const markReadSchema = z.object({
  action: z.literal('MARK_READ'),
  conversationId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const auth = await getAuthSession(request.headers);
    const body = await request.json();

    // 1. ACTION: SEND_MESSAGE
    if (body.action === 'SEND_MESSAGE') {
      const parsed = sendMessageSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ success: false, message: 'Invalid message payload' }, { status: 400 });
      }

      const { attachmentUrl, attachmentType } = parsed.data;
      if (attachmentUrl) {
        if (!attachmentType || !ALLOWED_ATTACHMENT_TYPES.includes(attachmentType.split(';')[0])) {
          return NextResponse.json(
            { success: false, message: 'This file type is not supported.', code: 'INVALID_ATTACHMENT' },
            { status: 400 }
          );
        }
        if (!attachmentUrl.startsWith('data:')) {
          return NextResponse.json(
            { success: false, message: 'Attachment must be uploaded from your device.', code: 'INVALID_ATTACHMENT' },
            { status: 400 }
          );
        }
        // Base64 payload is ~4/3 of the binary size.
        const approxBytes = Math.floor(((attachmentUrl.length - attachmentUrl.indexOf(',') - 1) * 3) / 4);
        if (approxBytes > MAX_ATTACHMENT_BYTES) {
          return NextResponse.json(
            { success: false, message: 'Attachments are limited to 5 MB.', code: 'ATTACHMENT_TOO_LARGE' },
            { status: 413 }
          );
        }
      }

      const msg = await ChatService.sendMessage(
        auth.orgId,
        { id: auth.userId, name: auth.name, role: auth.role },
        parsed.data
      );

      return NextResponse.json({ success: true, data: msg });
    }

    // ACTION: EDIT_MESSAGE (sender only)
    if (body.action === 'EDIT_MESSAGE') {
      const parsed = editMessageSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ success: false, message: 'Invalid edit payload' }, { status: 400 });
      }
      const updated = await ChatService.editMessage(
        auth.orgId,
        auth.userId,
        parsed.data.conversationId,
        parsed.data.messageId,
        parsed.data.text
      );
      return NextResponse.json({ success: true, data: updated });
    }

    // 2. ACTION: DELETE_MESSAGE (for me / for everyone)
    if (body.action === 'DELETE_MESSAGE') {
      const parsed = deleteMessageSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ success: false, message: 'Invalid delete payload' }, { status: 400 });
      }

      const updatedMsg = await ChatService.deleteMessage(
        auth.orgId,
        auth.userId,
        parsed.data.conversationId,
        parsed.data.messageId,
        parsed.data.scope
      );

      return NextResponse.json({ success: true, data: updatedMsg });
    }

    // 3. ACTION: FORWARD_MESSAGE
    if (body.action === 'FORWARD_MESSAGE') {
      const parsed = forwardMessageSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ success: false, message: 'Invalid forward payload' }, { status: 400 });
      }

      const forwardedList = await ChatService.forwardMessage(
        auth.orgId,
        { id: auth.userId, name: auth.name, role: auth.role },
        parsed.data
      );

      return NextResponse.json({ success: true, data: forwardedList });
    }

    // 4. ACTION: REACT_MESSAGE
    if (body.action === 'REACT_MESSAGE') {
      const parsed = reactMessageSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ success: false, message: 'Invalid react payload' }, { status: 400 });
      }

      const updated = await ChatService.reactMessage(
        auth.orgId,
        { id: auth.userId, name: auth.name },
        parsed.data.conversationId,
        parsed.data.messageId,
        parsed.data.emoji
      );

      return NextResponse.json({ success: true, data: updated });
    }

    // 5. ACTION: TOGGLE_STAR
    if (body.action === 'TOGGLE_STAR') {
      const parsed = toggleStarSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ success: false, message: 'Invalid star payload' }, { status: 400 });
      }

      const updated = await ChatService.toggleStarMessage(
        auth.orgId,
        parsed.data.conversationId,
        parsed.data.messageId
      );

      return NextResponse.json({ success: true, data: updated });
    }

    // 6. ACTION: CREATE_CONVERSATION
    if (body.action === 'CREATE_CONVERSATION') {
      const parsed = createConversationSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ success: false, message: 'Invalid conversation data' }, { status: 400 });
      }

      const newConv = await ChatService.createConversation(
        auth.orgId,
        { id: auth.userId, name: auth.name, role: auth.role },
        parsed.data
      );

      return NextResponse.json({ success: true, data: newConv });
    }

    // 7. ACTION: MARK_READ
    if (body.action === 'MARK_READ') {
      const parsed = markReadSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
      }

      await ChatService.markAsRead(auth.orgId, parsed.data.conversationId);
      return NextResponse.json({ success: true, message: 'Marked as read' });
    }

    return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return errorResponse(err);
  }
}
