// src/server/services/messaging.service.ts
// Enterprise-grade In-App Messaging Service for Legacy School Solwezi
// Connecting Teachers, Parents, Boarding Pastoral Staff, and School Administration

export type MessageRole = 'TEACHER' | 'PARENT' | 'ADMIN' | 'BOARDING_MASTER' | 'BURSAR';

export interface ChatParticipant {
  id: string;
  name: string;
  role: MessageRole;
  roleTitle: string;
  avatarText: string;
  avatarBg: string;
  phone: string;
  online: boolean;
  lastSeen?: string;
  associatedLearner?: {
    id: string;
    name: string;
    className: string;
    studentNumber: string;
    attendanceRate: number;
    feeStatus: 'CLEARED' | 'PENDING' | 'OVERDUE';
    dormitory?: string;
  };
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: MessageRole;
  content: string;
  timestamp: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  isOutgoing: boolean;
  attachment?: {
    type: 'DOCUMENT' | 'IMAGE' | 'VOICE_NOTE' | 'REPORT_CARD';
    name: string;
    size?: string;
    url?: string;
    duration?: string;
  };
  smartTag?: 'ACADEMIC' | 'ATTENDANCE' | 'PASTORAL' | 'FINANCE' | 'URGENT';
}

export interface ChatConversation {
  id: string;
  type: 'DIRECT_PARENT_TEACHER' | 'STAFF_ROOM' | 'BOARDING_PASTORAL' | 'BROADCAST_ANNOUNCEMENT';
  title: string;
  subtitle: string;
  category: 'PARENTS' | 'STAFF' | 'BROADCASTS';
  participant: ChatParticipant;
  unreadCount: number;
  lastMessage: {
    content: string;
    timestamp: string;
    senderId: string;
    status: 'SENT' | 'DELIVERED' | 'READ';
  };
  pinnedStudent?: {
    name: string;
    className: string;
    studentNumber: string;
    attendanceRate: number;
    feeStatus: 'CLEARED' | 'PENDING' | 'OVERDUE';
    dormitory?: string;
  };
}

export const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-1',
    type: 'DIRECT_PARENT_TEACHER',
    title: 'Mrs. Natasha Mwewa (Bupe\'s Mother)',
    subtitle: 'Re: Bupe Mwewa • Grade 10A Science',
    category: 'PARENTS',
    participant: {
      id: 'part-parent-1',
      name: 'Mrs. Natasha Mwewa',
      role: 'PARENT',
      roleTitle: 'Verified Guardian of Bupe Mwewa',
      avatarText: 'NM',
      avatarBg: 'bg-emerald-600',
      phone: '+260 97 782 1904',
      online: true,
      associatedLearner: {
        id: 'L-101',
        name: 'Bupe Mwewa',
        className: 'Grade 10A Science',
        studentNumber: 'LS-2026-0042',
        attendanceRate: 98.2,
        feeStatus: 'CLEARED',
        dormitory: 'Kansanshi Boys Block A - Cubicle 4',
      },
    },
    unreadCount: 1,
    lastMessage: {
      content: 'Mwashibukeni Sir. Just checking if Bupe received the revised chemistry mock timetable?',
      timestamp: '16:42 CAT',
      senderId: 'part-parent-1',
      status: 'DELIVERED',
    },
    pinnedStudent: {
      name: 'Bupe Mwewa',
      className: 'Grade 10A Science',
      studentNumber: 'LS-2026-0042',
      attendanceRate: 98.2,
      feeStatus: 'CLEARED',
      dormitory: 'Kansanshi Boys Block A - Cubicle 4',
    },
  },
  {
    id: 'conv-2',
    type: 'STAFF_ROOM',
    title: 'Mathematics Department HOD Circle',
    subtitle: 'Mr. Mulenga, Mrs. Kunda, Mr. Banda, Mr. Mwansa',
    category: 'STAFF',
    participant: {
      id: 'part-hod-math',
      name: 'Mr. C. Mulenga (HOD Math)',
      role: 'TEACHER',
      roleTitle: 'Senior Teacher & Mathematics HOD',
      avatarText: 'CM',
      avatarBg: 'bg-blue-600',
      phone: '+260 96 612 8841',
      online: true,
    },
    unreadCount: 0,
    lastMessage: {
      content: 'All Form 4 CA2 topic test score sheets are approved and synced to ECZ gradebooks.',
      timestamp: '15:15 CAT',
      senderId: 'part-hod-math',
      status: 'READ',
    },
  },
  {
    id: 'conv-3',
    type: 'BOARDING_PASTORAL',
    title: 'Mr. Joseph Banda (Kansanshi Boys Housemaster)',
    subtitle: 'Dormitory Curfew & Exeat Monitoring',
    category: 'STAFF',
    participant: {
      id: 'part-hm-banda',
      name: 'Mr. Joseph Banda',
      role: 'BOARDING_MASTER',
      roleTitle: 'Resident Housemaster - Kansanshi Campus',
      avatarText: 'JB',
      avatarBg: 'bg-indigo-600',
      phone: '+260 97 904 3321',
      online: false,
      lastSeen: '16:10 CAT',
    },
    unreadCount: 0,
    lastMessage: {
      content: '21:00 Curfew bed check logged on mobile APK: 142/142 boarders safely accounted for.',
      timestamp: 'Yesterday',
      senderId: 'part-hm-banda',
      status: 'READ',
    },
  },
  {
    id: 'conv-4',
    type: 'DIRECT_PARENT_TEACHER',
    title: 'Mr. Godfrey Phiri (Kondwani\'s Father)',
    subtitle: 'Re: Kondwani Phiri • Grade 7 Blue Day Scholar',
    category: 'PARENTS',
    participant: {
      id: 'part-parent-2',
      name: 'Mr. Godfrey Phiri',
      role: 'PARENT',
      roleTitle: 'Verified Guardian of Kondwani Phiri',
      avatarText: 'GP',
      avatarBg: 'bg-purple-600',
      phone: '+260 95 541 0092',
      online: false,
      lastSeen: '14:22 CAT',
      associatedLearner: {
        id: 'L-204',
        name: 'Kondwani Phiri',
        className: 'Grade 7 Blue',
        studentNumber: 'LS-2026-0118',
        attendanceRate: 94.6,
        feeStatus: 'CLEARED',
        dormitory: 'Day Scholar (Mushitala Shuttle Route #2)',
      },
    },
    unreadCount: 0,
    lastMessage: {
      content: 'Thank you for the update on Kondwani\'s reading progress. We will practice the vocabulary tonight.',
      timestamp: '13:04 CAT',
      senderId: 'part-parent-2',
      status: 'READ',
    },
    pinnedStudent: {
      name: 'Kondwani Phiri',
      className: 'Grade 7 Blue',
      studentNumber: 'LS-2026-0118',
      attendanceRate: 94.6,
      feeStatus: 'CLEARED',
      dormitory: 'Day Scholar (Mushitala Shuttle Route #2)',
    },
  },
  {
    id: 'conv-5',
    type: 'BROADCAST_ANNOUNCEMENT',
    title: 'Office of the Director: Mr. Emmanuel Mwansa',
    subtitle: 'Official Institutional Broadcast Channel',
    category: 'BROADCASTS',
    participant: {
      id: 'part-director',
      name: 'Mr. Emmanuel Mwansa',
      role: 'ADMIN',
      roleTitle: 'Managing Director & Principal',
      avatarText: 'EM',
      avatarBg: 'bg-amber-600',
      phone: '+260 97 123 4567',
      online: true,
    },
    unreadCount: 0,
    lastMessage: {
      content: 'Notice to all Parents & Faculty: Mid-term consultative conference will take place this Saturday, 24th October.',
      timestamp: 'Monday',
      senderId: 'part-director',
      status: 'READ',
    },
  },
];

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-1': [
    {
      id: 'msg-101',
      conversationId: 'conv-1',
      senderId: 'part-teacher-me',
      senderName: 'Mr. Emmanuel Chisenga',
      senderRole: 'TEACHER',
      content: 'Good afternoon Mrs. Mwewa. Bupe performed excellently in today\'s science practical on titration. Scored 19/20.',
      timestamp: '15:20 CAT',
      status: 'READ',
      isOutgoing: true,
      smartTag: 'ACADEMIC',
    },
    {
      id: 'msg-102',
      conversationId: 'conv-1',
      senderId: 'part-parent-1',
      senderName: 'Mrs. Natasha Mwewa',
      senderRole: 'PARENT',
      content: 'Mwaboneni Sir Chisenga! That is wonderful news. He has been studying hard in the dormitory evenings.',
      timestamp: '15:45 CAT',
      status: 'READ',
      isOutgoing: false,
    },
    {
      id: 'msg-103',
      conversationId: 'conv-1',
      senderId: 'part-teacher-me',
      senderName: 'Mr. Emmanuel Chisenga',
      senderRole: 'TEACHER',
      content: 'Here is his continuous assessment summary for your records:',
      timestamp: '16:02 CAT',
      status: 'READ',
      isOutgoing: true,
      attachment: {
        type: 'REPORT_CARD',
        name: 'Bupe_Mwewa_CA2_Science_Progress.pdf',
        size: '184 KB',
      },
      smartTag: 'ACADEMIC',
    },
    {
      id: 'msg-104',
      conversationId: 'conv-1',
      senderId: 'part-parent-1',
      senderName: 'Mrs. Natasha Mwewa',
      senderRole: 'PARENT',
      content: 'Mwashibukeni Sir. Just checking if Bupe received the revised chemistry mock timetable?',
      timestamp: '16:42 CAT',
      status: 'DELIVERED',
      isOutgoing: false,
    },
  ],
  'conv-2': [
    {
      id: 'msg-201',
      conversationId: 'conv-2',
      senderId: 'part-teacher-me',
      senderName: 'You (Faculty)',
      senderRole: 'TEACHER',
      content: 'Colleagues, please ensure all Form 2 and Form 4 algebra diagnostic sheets are handed to the academic office by 14:00.',
      timestamp: '11:15 CAT',
      status: 'READ',
      isOutgoing: true,
    },
    {
      id: 'msg-202',
      conversationId: 'conv-2',
      senderId: 'part-hod-math',
      senderName: 'Mr. C. Mulenga (HOD Math)',
      senderRole: 'TEACHER',
      content: 'All Form 4 CA2 topic test score sheets are approved and synced to ECZ gradebooks.',
      timestamp: '15:15 CAT',
      status: 'READ',
      isOutgoing: false,
    },
  ],
};

export const SMART_TEMPLATES = [
  {
    id: 'tmpl-1',
    category: 'ATTENDANCE',
    label: 'Morning Absence Inquiry',
    text: 'Mwashibukeni. We noticed your ward was not present during morning roll-call today. Kindly advise if they are unwell so we can log an excused absence in the MoE register.',
  },
  {
    id: 'tmpl-2',
    category: 'ACADEMIC',
    label: 'Academic Commendation',
    text: 'Good afternoon. I am pleased to share that your ward achieved an outstanding result in today\'s continuous assessment. Their diligence is exemplary.',
  },
  {
    id: 'tmpl-3',
    category: 'PASTORAL',
    label: 'Boarding Curfew & Exeat Notice',
    text: 'Greetings. This is to confirm that the requested exeat gate pass for this weekend has been processed and endorsed by the Housemaster.',
  },
  {
    id: 'tmpl-4',
    category: 'FINANCE',
    label: 'Bursary Fee Clearance Receipt',
    text: 'Thank you for your fee payment via Mobile Money. The official receipt has been generated and reconciled to your student ledger account.',
  },
  {
    id: 'tmpl-5',
    category: 'CONSULTATION',
    label: 'Parent-Teacher Meeting Invite',
    text: 'We cordially invite you for a 15-minute academic progress consultation with the subject teachers this Thursday at 15:30 CAT.',
  },
];
