import { prisma } from '../db';
import { logAuditEvent } from '../audit';

export interface ChatMessage {
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

export interface ChatConversation {
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

export const DEFAULT_CONVERSATIONS: ChatConversation[] = [
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

export const DEFAULT_MESSAGES: Record<string, ChatMessage[]> = {
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

export class ChatService {
  static async getConversations(orgId: string): Promise<ChatConversation[]> {
    const record = await prisma.moduleWorkspaceRecord.findUnique({
      where: {
        organisationId_moduleSlug_title: {
          organisationId: orgId,
          moduleSlug: 'campus_chat',
          title: 'CHAT_CONVERSATIONS_INDEX',
        },
      },
    });

    if (record?.metadataJson) {
      try {
        const parsed = JSON.parse(record.metadataJson);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }

    return DEFAULT_CONVERSATIONS;
  }

  static async getMessages(orgId: string, conversationId: string): Promise<ChatMessage[]> {
    const record = await prisma.moduleWorkspaceRecord.findUnique({
      where: {
        organisationId_moduleSlug_title: {
          organisationId: orgId,
          moduleSlug: 'campus_chat',
          title: `CHAT_MESSAGES_${conversationId}`,
        },
      },
    });

    if (record?.metadataJson) {
      try {
        const parsed = JSON.parse(record.metadataJson);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }

    return DEFAULT_MESSAGES[conversationId] || [];
  }

  static async sendMessage(
    orgId: string,
    sender: { id: string; name: string; role: string },
    params: {
      conversationId: string;
      text: string;
      attachmentName?: string;
      attachmentUrl?: string;
      attachmentType?: string;
    }
  ): Promise<ChatMessage> {
    const { conversationId, text, attachmentName, attachmentUrl, attachmentType } = params;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      conversationId,
      senderId: sender.id,
      senderName: sender.name,
      senderRole: sender.role,
      text,
      attachmentName,
      attachmentUrl,
      attachmentType,
      createdAt: new Date().toISOString(),
      status: 'delivered',
    };

    const currentMessages = await this.getMessages(orgId, conversationId);
    currentMessages.push(newMessage);

    // Persist messages in DB
    await prisma.moduleWorkspaceRecord.upsert({
      where: {
        organisationId_moduleSlug_title: {
          organisationId: orgId,
          moduleSlug: 'campus_chat',
          title: `CHAT_MESSAGES_${conversationId}`,
        },
      },
      create: {
        organisationId: orgId,
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

    // Update conversation index
    const currentConversations = await this.getConversations(orgId);
    const convIndex = currentConversations.findIndex((c) => c.id === conversationId);
    if (convIndex >= 0) {
      currentConversations[convIndex] = {
        ...currentConversations[convIndex],
        lastMessage: {
          text,
          senderName: sender.name,
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
          organisationId: orgId,
          moduleSlug: 'campus_chat',
          title: 'CHAT_CONVERSATIONS_INDEX',
        },
      },
      create: {
        organisationId: orgId,
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

    await logAuditEvent({
      organisationId: orgId,
      userId: sender.id,
      action: 'CHAT_MESSAGE_SENT',
      entityType: 'ChatMessage',
      entityId: newMessage.id,
      details: {
        conversationId,
        hasAttachment: Boolean(attachmentName),
        charCount: text.length,
      },
    });

    return newMessage;
  }

  static async createConversation(
    orgId: string,
    creator: { id: string; name: string; role: string },
    params: {
      title: string;
      type: 'DIRECT' | 'GROUP';
      participantId?: string;
      participantName?: string;
      participantRole?: string;
      department?: string;
      initialMessage?: string;
    }
  ): Promise<ChatConversation> {
    const { title, type, participantId, participantName, participantRole, department, initialMessage } = params;
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
        { id: creator.id, name: creator.name, role: creator.role, isOnline: true },
        ...(participantId
          ? [{ id: participantId, name: participantName || title, role: participantRole || 'Staff', isOnline: true }]
          : []),
      ],
      lastMessage: initialMessage
        ? {
            text: initialMessage,
            senderName: creator.name,
            createdAt: new Date().toISOString(),
            status: 'sent',
            isMine: true,
          }
        : undefined,
    };

    const currentConversations = await this.getConversations(orgId);
    currentConversations.unshift(newConv);

    await prisma.moduleWorkspaceRecord.upsert({
      where: {
        organisationId_moduleSlug_title: {
          organisationId: orgId,
          moduleSlug: 'campus_chat',
          title: 'CHAT_CONVERSATIONS_INDEX',
        },
      },
      create: {
        organisationId: orgId,
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

    if (initialMessage) {
      await this.sendMessage(orgId, creator, {
        conversationId: newConvId,
        text: initialMessage,
      });
    }

    await logAuditEvent({
      organisationId: orgId,
      userId: creator.id,
      action: 'CHAT_CONVERSATION_CREATED',
      entityType: 'ChatConversation',
      entityId: newConvId,
      details: { title, type },
    });

    return newConv;
  }

  static async markAsRead(orgId: string, conversationId: string): Promise<boolean> {
    const currentConversations = await this.getConversations(orgId);
    const updated = currentConversations.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c));

    const record = await prisma.moduleWorkspaceRecord.findUnique({
      where: {
        organisationId_moduleSlug_title: {
          organisationId: orgId,
          moduleSlug: 'campus_chat',
          title: 'CHAT_CONVERSATIONS_INDEX',
        },
      },
    });

    if (record) {
      await prisma.moduleWorkspaceRecord.update({
        where: { id: record.id },
        data: { metadataJson: JSON.stringify(updated) },
      });
    }
    return true;
  }
}
