import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { extractSessionToken, verifyToken } from '@/server/auth';
import { logAuditEvent } from '@/server/audit';

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  text: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';
}

interface ChatConversation {
  id: string;
  title: string;
  type: 'DIRECT' | 'GROUP';
  department?: string;
  avatar?: string;
  isVerified?: boolean;
  participants: {
    id: string;
    name: string;
    role: string;
    isOnline?: boolean;
    department?: string;
  }[];
  lastMessage?: {
    text: string;
    senderName: string;
    createdAt: string;
    status: 'sent' | 'delivered' | 'read';
    isMine?: boolean;
  };
  unreadCount: number;
  updatedAt: string;
}

const DEFAULT_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-group-clinical',
    title: '🏥 Clinical Learning & Solwezi Rotations',
    type: 'GROUP',
    department: 'Clinical Medicine & Nursing',
    isVerified: true,
    avatar: '🏥',
    unreadCount: 2,
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    participants: [
      { id: 'usr-dean', name: 'Dr. Emmanuel Sichone', role: 'Head of Clinical Medicine', isOnline: true, department: 'Clinical Medicine' },
      { id: 'usr-preceptor', name: 'Sr. Chilufya Banda', role: 'Senior Clinical Instructor', isOnline: true, department: 'Nursing' },
      { id: 'usr-brian', name: 'Brian Mulenga', role: 'Clinical Training Preceptor', isOnline: false, department: 'Medical Laboratory' },
      { id: 'usr-grace', name: 'Grace Mwape', role: 'Lecturer in Midwifery', isOnline: true, department: 'Midwifery' },
    ],
    lastMessage: {
      text: 'Solwezi General Hospital ward rotation rosters for November 2026 have been uploaded and approved by the Medical Superintendent.',
      senderName: 'Dr. Emmanuel Sichone',
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      status: 'read',
    },
  },
  {
    id: 'conv-group-senate',
    title: '🎓 Academic Senate & Examinations Board',
    type: 'GROUP',
    department: 'Senate & Academic Registry',
    isVerified: true,
    avatar: '🎓',
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    participants: [
      { id: 'usr-principal', name: 'Prof. Manyando Kabisa', role: 'Executive Principal & CEO', isOnline: true, department: 'Executive Directorate' },
      { id: 'usr-registrar', name: 'Mr. Patrick Chileshe', role: 'Academic Registrar', isOnline: true, department: 'Academic Registry' },
      { id: 'usr-dean', name: 'Dr. Emmanuel Sichone', role: 'Dean of Health Sciences', isOnline: true, department: 'Clinical Medicine' },
    ],
    lastMessage: {
      text: 'Final semester exam papers must be moderated and verified with the statutory 85% attendance clearance list by Friday.',
      senderName: 'Mr. Patrick Chileshe',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      status: 'read',
    },
  },
  {
    id: 'conv-direct-sichone',
    title: 'Dr. Emmanuel Sichone',
    type: 'DIRECT',
    department: 'Clinical Medicine',
    isVerified: true,
    avatar: '👨‍⚕️',
    unreadCount: 1,
    updatedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    participants: [
      { id: 'usr-sichone', name: 'Dr. Emmanuel Sichone', role: 'Head of Clinical Medicine', isOnline: true, department: 'Clinical Medicine' },
    ],
    lastMessage: {
      text: 'Please confirm if the skills laboratory has received the new adult resuscitation manikins for next week’s OSCE assessment.',
      senderName: 'Dr. Emmanuel Sichone',
      createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      status: 'delivered',
    },
  },
  {
    id: 'conv-direct-chilufya',
    title: 'Sr. Chilufya Banda',
    type: 'DIRECT',
    department: 'Nursing & Midwifery',
    isVerified: true,
    avatar: '👩‍⚕️',
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    participants: [
      { id: 'usr-chilufya', name: 'Sr. Chilufya Banda', role: 'Senior Clinical Instructor (RN)', isOnline: true, department: 'Nursing' },
    ],
    lastMessage: {
      text: 'NMCZ verification for Year 1 student index cards is 100% complete for the January 2026 intake cohort.',
      senderName: 'Sr. Chilufya Banda',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'read',
    },
  },
  {
    id: 'conv-direct-bursar',
    title: 'Bursar & Accounts Office',
    type: 'DIRECT',
    department: 'Finance Directorate',
    isVerified: true,
    avatar: '💰',
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    participants: [
      { id: 'usr-bursar', name: 'Chanda Bwalya', role: 'Chief Accountant & Bursar', isOnline: false, department: 'Finance' },
    ],
    lastMessage: {
      text: 'ZRA PAYE and NAPSA October statutory reconciliation schedules have been locked and queued for e-filing.',
      senderName: 'Chanda Bwalya',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: 'read',
    },
  },
];

const DEFAULT_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-group-clinical': [
    {
      id: 'msg-cl-1',
      conversationId: 'conv-group-clinical',
      senderId: 'usr-dean',
      senderName: 'Dr. Emmanuel Sichone',
      senderRole: 'Head of Clinical Medicine',
      text: 'Colleagues, Solwezi General Hospital has confirmed the schedule for Year 2 clinical rotation attachments commencing next Monday.',
      createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      status: 'read',
    },
    {
      id: 'msg-cl-2',
      conversationId: 'conv-group-clinical',
      senderId: 'usr-preceptor',
      senderName: 'Sr. Chilufya Banda',
      senderRole: 'Senior Clinical Instructor',
      text: 'Logbooks and PPE supplies have been distributed to all 32 learners assigned to the Pediatric and Obstetric wards.',
      createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      status: 'read',
    },
    {
      id: 'msg-cl-3',
      conversationId: 'conv-group-clinical',
      senderId: 'usr-dean',
      senderName: 'Dr. Emmanuel Sichone',
      senderRole: 'Head of Clinical Medicine',
      text: 'Solwezi General Hospital ward rotation rosters for November 2026 have been uploaded and approved by the Medical Superintendent.',
      attachmentName: 'Solwezi_Ward_Rotation_Schedule_Nov2026.pdf',
      attachmentUrl: '#',
      attachmentType: 'application/pdf',
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      status: 'read',
    },
  ],
  'conv-direct-sichone': [
    {
      id: 'msg-sc-1',
      conversationId: 'conv-direct-sichone',
      senderId: 'usr-sichone',
      senderName: 'Dr. Emmanuel Sichone',
      senderRole: 'Head of Clinical Medicine',
      text: 'Good afternoon. The HPCZ inspector commended the college on our skills lab setup during yesterday’s preliminary evaluation.',
      createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      status: 'read',
    },
    {
      id: 'msg-sc-2',
      conversationId: 'conv-direct-sichone',
      senderId: 'usr-sichone',
      senderName: 'Dr. Emmanuel Sichone',
      senderRole: 'Head of Clinical Medicine',
      text: 'Please confirm if the skills laboratory has received the new adult resuscitation manikins for next week’s OSCE assessment.',
      createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      status: 'delivered',
    },
  ],
};

async function getAuthSession(headers: Headers) {
  const token = extractSessionToken(headers);
  const session = token ? verifyToken(token) : null;
  const org =
    (await prisma.organisation.findFirst({ where: { code: 'NWUCHAS' } })) ||
    (await prisma.organisation.findFirst());
  const fullName = session ? `${session.firstName || ''} ${session.lastName || ''}`.trim() : '';
  return {
    orgId: session?.organisationId || org?.id || 'nwuchas-main',
    userId: session?.userId || 'usr-principal',
    name: fullName || session?.email || 'College Administrator',
    role: session?.role || 'INSTITUTION_ADMIN',
  };
}

export async function GET(request: Request) {
  try {
    const auth = await getAuthSession(request.headers);
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    // 1. Fetch conversations from persistent module records
    const convRecord = await prisma.moduleWorkspaceRecord.findUnique({
      where: {
        organisationId_moduleSlug_title: {
          organisationId: auth.orgId,
          moduleSlug: 'campus_chat',
          title: 'CHAT_CONVERSATIONS_INDEX',
        },
      },
    });

    let conversations: ChatConversation[] = DEFAULT_CONVERSATIONS;
    if (convRecord?.metadataJson) {
      try {
        const parsed = JSON.parse(convRecord.metadataJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          conversations = parsed;
        }
      } catch {}
    }

    // If specific conversation messages requested:
    if (conversationId) {
      const msgRecord = await prisma.moduleWorkspaceRecord.findUnique({
        where: {
          organisationId_moduleSlug_title: {
            organisationId: auth.orgId,
            moduleSlug: 'campus_chat',
            title: `CHAT_MESSAGES_${conversationId}`,
          },
        },
      });

      let messages: ChatMessage[] = DEFAULT_MESSAGES[conversationId] || [];
      if (msgRecord?.metadataJson) {
        try {
          const parsed = JSON.parse(msgRecord.metadataJson);
          if (Array.isArray(parsed)) {
            messages = parsed;
          }
        } catch {}
      }

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
      take: 20,
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
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

const sendMessageSchema = z.object({
  action: z.literal('SEND_MESSAGE'),
  conversationId: z.string().min(1),
  text: z.string().trim().min(1).max(5000),
  attachmentName: z.string().optional(),
  attachmentUrl: z.string().optional(),
  attachmentType: z.string().optional(),
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

      const { conversationId, text, attachmentName, attachmentUrl, attachmentType } = parsed.data;

      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        conversationId,
        senderId: auth.userId,
        senderName: auth.name,
        senderRole: auth.role,
        text,
        attachmentName,
        attachmentUrl,
        attachmentType,
        createdAt: new Date().toISOString(),
        status: 'delivered',
      };

      // Load existing messages for this conversation
      const msgRecord = await prisma.moduleWorkspaceRecord.findUnique({
        where: {
          organisationId_moduleSlug_title: {
            organisationId: auth.orgId,
            moduleSlug: 'campus_chat',
            title: `CHAT_MESSAGES_${conversationId}`,
          },
        },
      });

      let currentMessages: ChatMessage[] = DEFAULT_MESSAGES[conversationId] || [];
      if (msgRecord?.metadataJson) {
        try {
          const loaded = JSON.parse(msgRecord.metadataJson);
          if (Array.isArray(loaded)) currentMessages = loaded;
        } catch {}
      }

      currentMessages.push(newMessage);

      // Persist messages in DB
      await prisma.moduleWorkspaceRecord.upsert({
        where: {
          organisationId_moduleSlug_title: {
            organisationId: auth.orgId,
            moduleSlug: 'campus_chat',
            title: `CHAT_MESSAGES_${conversationId}`,
          },
        },
        create: {
          organisationId: auth.orgId,
          moduleSlug: 'campus_chat',
          title: `CHAT_MESSAGES_${conversationId}`,
          status: 'ACTIVE',
          summary: `${currentMessages.length} messages in conversation ${conversationId}`,
          metadataJson: JSON.stringify(currentMessages),
        },
        update: {
          status: 'ACTIVE',
          summary: `${currentMessages.length} messages in conversation ${conversationId}`,
          metadataJson: JSON.stringify(currentMessages),
          updatedAt: new Date(),
        },
      });

      // Update Conversation Index
      const convRecord = await prisma.moduleWorkspaceRecord.findUnique({
        where: {
          organisationId_moduleSlug_title: {
            organisationId: auth.orgId,
            moduleSlug: 'campus_chat',
            title: 'CHAT_CONVERSATIONS_INDEX',
          },
        },
      });

      let currentConversations: ChatConversation[] = DEFAULT_CONVERSATIONS;
      if (convRecord?.metadataJson) {
        try {
          const loaded = JSON.parse(convRecord.metadataJson);
          if (Array.isArray(loaded)) currentConversations = loaded;
        } catch {}
      }

      const convIndex = currentConversations.findIndex((c) => c.id === conversationId);
      if (convIndex >= 0) {
        currentConversations[convIndex] = {
          ...currentConversations[convIndex],
          lastMessage: {
            text,
            senderName: auth.name,
            createdAt: newMessage.createdAt,
            status: 'delivered',
            isMine: true,
          },
          updatedAt: newMessage.createdAt,
        };
      }

      await prisma.moduleWorkspaceRecord.upsert({
        where: {
          organisationId_moduleSlug_title: {
            organisationId: auth.orgId,
            moduleSlug: 'campus_chat',
            title: 'CHAT_CONVERSATIONS_INDEX',
          },
        },
        create: {
          organisationId: auth.orgId,
          moduleSlug: 'campus_chat',
          title: 'CHAT_CONVERSATIONS_INDEX',
          status: 'ACTIVE',
          summary: `Updated chat index with ${currentConversations.length} conversations`,
          metadataJson: JSON.stringify(currentConversations),
        },
        update: {
          summary: `Updated chat index with ${currentConversations.length} conversations`,
          metadataJson: JSON.stringify(currentConversations),
          updatedAt: new Date(),
        },
      });

      // Audit event
      await logAuditEvent({
        organisationId: auth.orgId,
        userId: auth.userId,
        action: 'CHAT_MESSAGE_SENT',
        entityType: 'ChatMessage',
        entityId: newMessage.id,
        details: {
          conversationId,
          hasAttachment: Boolean(attachmentName),
          charCount: text.length,
        },
      });

      return NextResponse.json({ success: true, data: newMessage });
    }

    // 2. ACTION: CREATE_CONVERSATION
    if (body.action === 'CREATE_CONVERSATION') {
      const parsed = createConversationSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ success: false, message: 'Invalid conversation data' }, { status: 400 });
      }

      const { title, type, participantId, participantName, participantRole, department, initialMessage } = parsed.data;
      const newConvId = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      const newConv: ChatConversation = {
        id: newConvId,
        title,
        type,
        department: department || 'Institutional',
        avatar: type === 'GROUP' ? '👥' : '👤',
        isVerified: true,
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
        participants: [
          { id: auth.userId, name: auth.name, role: auth.role, isOnline: true },
          ...(participantId
            ? [{ id: participantId, name: participantName || title, role: participantRole || 'Staff', isOnline: true }]
            : []),
        ],
        lastMessage: initialMessage
          ? {
              text: initialMessage,
              senderName: auth.name,
              createdAt: new Date().toISOString(),
              status: 'sent',
              isMine: true,
            }
          : undefined,
      };

      // Load conversations
      const convRecord = await prisma.moduleWorkspaceRecord.findUnique({
        where: {
          organisationId_moduleSlug_title: {
            organisationId: auth.orgId,
            moduleSlug: 'campus_chat',
            title: 'CHAT_CONVERSATIONS_INDEX',
          },
        },
      });

      let currentConversations: ChatConversation[] = DEFAULT_CONVERSATIONS;
      if (convRecord?.metadataJson) {
        try {
          const loaded = JSON.parse(convRecord.metadataJson);
          if (Array.isArray(loaded)) currentConversations = loaded;
        } catch {}
      }

      currentConversations.unshift(newConv);

      await prisma.moduleWorkspaceRecord.upsert({
        where: {
          organisationId_moduleSlug_title: {
            organisationId: auth.orgId,
            moduleSlug: 'campus_chat',
            title: 'CHAT_CONVERSATIONS_INDEX',
          },
        },
        create: {
          organisationId: auth.orgId,
          moduleSlug: 'campus_chat',
          title: 'CHAT_CONVERSATIONS_INDEX',
          status: 'ACTIVE',
          summary: `Updated chat index with ${currentConversations.length} conversations`,
          metadataJson: JSON.stringify(currentConversations),
        },
        update: {
          metadataJson: JSON.stringify(currentConversations),
          updatedAt: new Date(),
        },
      });

      // If initial message provided, save to thread
      if (initialMessage) {
        const initialMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          conversationId: newConvId,
          senderId: auth.userId,
          senderName: auth.name,
          senderRole: auth.role,
          text: initialMessage,
          createdAt: new Date().toISOString(),
          status: 'delivered',
        };

        await prisma.moduleWorkspaceRecord.create({
          data: {
            organisationId: auth.orgId,
            moduleSlug: 'campus_chat',
            title: `CHAT_MESSAGES_${newConvId}`,
            status: 'ACTIVE',
            summary: `Initial message in conversation ${newConvId}`,
            metadataJson: JSON.stringify([initialMsg]),
          },
        });
      }

      await logAuditEvent({
        organisationId: auth.orgId,
        userId: auth.userId,
        action: 'CHAT_CONVERSATION_CREATED',
        entityType: 'ChatConversation',
        entityId: newConvId,
        details: { title, type },
      });

      return NextResponse.json({ success: true, data: newConv });
    }

    // 3. ACTION: MARK_READ
    if (body.action === 'MARK_READ') {
      const parsed = markReadSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
      }

      const { conversationId } = parsed.data;

      const convRecord = await prisma.moduleWorkspaceRecord.findUnique({
        where: {
          organisationId_moduleSlug_title: {
            organisationId: auth.orgId,
            moduleSlug: 'campus_chat',
            title: 'CHAT_CONVERSATIONS_INDEX',
          },
        },
      });

      if (convRecord?.metadataJson) {
        try {
          const list: ChatConversation[] = JSON.parse(convRecord.metadataJson);
          const updated = list.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c));
          await prisma.moduleWorkspaceRecord.update({
            where: { id: convRecord.id },
            data: { metadataJson: JSON.stringify(updated) },
          });
        } catch {}
      }

      return NextResponse.json({ success: true, message: 'Marked as read' });
    }

    return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
