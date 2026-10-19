// src/app/messages/page.tsx
// WhatsApp-Style Enterprise In-App Messaging Platform for Legacy School Solwezi
// Connecting Teachers, Parents, Boarding Housemasters, and School Leadership
'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  Mic,
  MoreVertical,
  Check,
  CheckCheck,
  Phone,
  Video,
  FileText,
  User,
  GraduationCap,
  ShieldCheck,
  HeartHandshake,
  Sparkles,
  Download,
  Play,
  Pause,
  Clock,
  AlertCircle,
  ChevronLeft,
  Info,
  Calendar,
  Building2,
  CheckCircle2,
  ArrowRight,
  Filter,
  Volume2,
  Users,
  UserPlus,
  X,
  School,
  MapPin,
  Mail,
  BookOpen,
  Shield,
} from 'lucide-react';
import {
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  SMART_TEMPLATES,
  ChatConversation,
  ChatMessage,
  MessageRole,
} from '@/server/services/messaging.service';
import {
  LEGACY_STAFF_MEMBERS,
  generateLegacyLearners,
  LegacyLearnerBalance,
  LegacyStaffMember,
} from '@/server/services/legacySchoolData';

export default function MessagingPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [selectedConvId, setSelectedConvId] = useState<string>('conv-1');
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'PARENTS' | 'STAFF' | 'LEARNERS' | 'BROADCASTS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [activePersona, setActivePersona] = useState<'TEACHER' | 'PARENT' | 'ADMIN'>('TEACHER');
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Directory Modal State
  const [showDirectoryModal, setShowDirectoryModal] = useState(false);
  const [directoryTab, setDirectoryTab] = useState<'STAFF' | 'PARENTS' | 'LEARNERS'>('STAFF');
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryCampusFilter, setDirectoryCampusFilter] = useState('ALL');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load full school learners dataset (780 students)
  const allLearners = useMemo(() => generateLegacyLearners(780), []);

  // Derive unique parents & guardians list with linked student details
  const allParents = useMemo(() => {
    const map = new Map<string, {
      guardianName: string;
      guardianPhone: string;
      guardianEmail: string;
      studentName: string;
      studentId: string;
      classCohort: string;
      campus: string;
      attendanceRate: number;
      feeStatus: 'CLEARED' | 'PENDING' | 'OVERDUE';
      dormitory?: string;
    }>();

    allLearners.forEach((l) => {
      const key = `${l.guardian.name}-${l.guardian.phone}`;
      if (!map.has(key)) {
        map.set(key, {
          guardianName: l.guardian.name,
          guardianPhone: l.guardian.phone,
          guardianEmail: l.guardian.email,
          studentName: l.learnerName,
          studentId: l.studentNumber,
          classCohort: l.className,
          campus: l.campusName,
          attendanceRate: l.todayAttendance === 'PRESENT' ? 98.4 : 92.1,
          feeStatus: l.balance <= 0 ? 'CLEARED' : 'PENDING',
          dormitory: l.studentType === 'BOARDER' ? l.currentAccommodation?.dormRoom : 'Day Scholar',
        });
      }
    });

    return Array.from(map.values());
  }, [allLearners]);

  // Filtered Directory Data
  const filteredStaff = useMemo(() => {
    return LEGACY_STAFF_MEMBERS.filter((s) => {
      const matchCampus =
        directoryCampusFilter === 'ALL' ||
        (directoryCampusFilter === 'Mushitala' && s.campusName.toLowerCase().includes('mushitala')) ||
        (directoryCampusFilter === 'Urban' && s.campusName.toLowerCase().includes('urban'));

      const q = directorySearch.toLowerCase().trim();
      const fullName = `${s.firstName} ${s.lastName}`;
      const matchQuery =
        !q ||
        fullName.toLowerCase().includes(q) ||
        s.jobTitle.toLowerCase().includes(q) ||
        s.departmentLabel.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.email.toLowerCase().includes(q);

      return matchCampus && matchQuery;
    });
  }, [directorySearch, directoryCampusFilter]);

  const filteredParents = useMemo(() => {
    return allParents.filter((p) => {
      const matchCampus =
        directoryCampusFilter === 'ALL' ||
        (directoryCampusFilter === 'Mushitala' && p.campus.toLowerCase().includes('mushitala')) ||
        (directoryCampusFilter === 'Urban' && p.campus.toLowerCase().includes('urban'));

      const q = directorySearch.toLowerCase().trim();
      const matchQuery =
        !q ||
        p.guardianName.toLowerCase().includes(q) ||
        p.guardianPhone.includes(q) ||
        p.studentName.toLowerCase().includes(q) ||
        p.studentId.toLowerCase().includes(q) ||
        p.classCohort.toLowerCase().includes(q);

      return matchCampus && matchQuery;
    });
  }, [allParents, directorySearch, directoryCampusFilter]);

  const filteredLearners = useMemo(() => {
    return allLearners.filter((l) => {
      const matchCampus =
        directoryCampusFilter === 'ALL' ||
        (directoryCampusFilter === 'Mushitala' && l.campusName.toLowerCase().includes('mushitala')) ||
        (directoryCampusFilter === 'Urban' && l.campusName.toLowerCase().includes('urban'));

      const q = directorySearch.toLowerCase().trim();
      const dorm = l.currentAccommodation?.dormRoom || '';
      const matchQuery =
        !q ||
        l.learnerName.toLowerCase().includes(q) ||
        l.studentNumber.toLowerCase().includes(q) ||
        l.className.toLowerCase().includes(q) ||
        dorm.toLowerCase().includes(q);

      return matchCampus && matchQuery;
    });
  }, [allLearners, directorySearch, directoryCampusFilter]);

  const activeConversation = conversations.find((c) => c.id === selectedConvId) || conversations[0];
  const activeMessages = messagesMap[selectedConvId] || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, selectedConvId]);

  // Voice recording simulation
  useEffect(() => {
    if (isRecording) {
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Filter conversations in left pane
  const filteredConversations = conversations.filter((c) => {
    const matchesCategory =
      activeCategory === 'ALL' ||
      (activeCategory === 'PARENTS' && c.category === 'PARENTS') ||
      (activeCategory === 'STAFF' && c.category === 'STAFF') ||
      (activeCategory === 'LEARNERS' && c.category === 'LEARNERS') ||
      (activeCategory === 'BROADCASTS' && c.category === 'BROADCASTS');

    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Handle selecting a person from Directory to start or resume chat
  const handleSelectDirectoryContact = (type: 'STAFF' | 'PARENT' | 'LEARNER', item: any) => {
    let targetConvId = '';

    if (type === 'STAFF') {
      const staff = item as LegacyStaffMember;
      const fullName = `${staff.firstName} ${staff.lastName}`;
      const existing = conversations.find(
        (c) => c.participant.phone === staff.phone || c.id === `conv-staff-${staff.id}`
      );
      if (existing) {
        targetConvId = existing.id;
      } else {
        const initials = `${staff.firstName[0]}${staff.lastName[0]}`;
        const newConvId = `conv-staff-${staff.id}`;
        const newConv: ChatConversation = {
          id: newConvId,
          type: 'STAFF_ROOM',
          title: fullName,
          subtitle: `${staff.jobTitle} • ${staff.departmentLabel} (${staff.campusName})`,
          category: 'STAFF',
          participant: {
            id: `part-staff-${staff.id}`,
            name: fullName,
            role: 'TEACHER',
            roleTitle: staff.jobTitle,
            avatarText: initials || 'ST',
            avatarBg: 'bg-blue-700',
            phone: staff.phone,
            online: true,
          },
          unreadCount: 0,
          lastMessage: {
            content: `Staff consultation channel started with ${fullName}.`,
            timestamp: 'Just now',
            senderId: 'part-teacher-me',
            status: 'DELIVERED',
          },
        };

        const initialMsg: ChatMessage = {
          id: `msg-init-${Date.now()}`,
          conversationId: newConvId,
          senderId: 'system',
          senderName: 'Legacy School Solwezi Portal',
          senderRole: 'ADMIN',
          content: `Encrypted direct channel opened with ${fullName} (${staff.jobTitle}). Official communication guidelines apply.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' CAT',
          status: 'READ',
          isOutgoing: false,
          smartTag: 'PASTORAL',
        };

        setConversations((prev) => [newConv, ...prev]);
        setMessagesMap((prev) => ({ ...prev, [newConvId]: [initialMsg] }));
        targetConvId = newConvId;
      }
    } else if (type === 'PARENT') {
      const parent = item;
      const existing = conversations.find(
        (c) =>
          c.participant.phone === parent.guardianPhone ||
          c.pinnedStudent?.studentNumber === parent.studentId
      );
      if (existing) {
        targetConvId = existing.id;
      } else {
        const initials = parent.guardianName
          .split(' ')
          .map((n: string) => n[0])
          .slice(0, 2)
          .join('');
        const newConvId = `conv-parent-${parent.studentId}`;
        const newConv: ChatConversation = {
          id: newConvId,
          type: 'DIRECT_PARENT_TEACHER',
          title: `${parent.guardianName} (${parent.studentName}'s Guardian)`,
          subtitle: `Re: ${parent.studentName} • ${parent.classCohort}`,
          category: 'PARENTS',
          participant: {
            id: `part-parent-${parent.studentId}`,
            name: parent.guardianName,
            role: 'PARENT',
            roleTitle: `Verified Guardian of ${parent.studentName}`,
            avatarText: initials || 'GR',
            avatarBg: 'bg-emerald-700',
            phone: parent.guardianPhone,
            online: true,
            associatedLearner: {
              id: parent.studentId,
              name: parent.studentName,
              className: parent.classCohort,
              studentNumber: parent.studentId,
              attendanceRate: parent.attendanceRate,
              feeStatus: parent.feeStatus,
              dormitory: parent.dormitory,
            },
          },
          pinnedStudent: {
            name: parent.studentName,
            className: parent.classCohort,
            studentNumber: parent.studentId,
            attendanceRate: parent.attendanceRate,
            feeStatus: parent.feeStatus,
            dormitory: parent.dormitory,
          },
          unreadCount: 0,
          lastMessage: {
            content: `Guardian channel opened for ${parent.studentName}.`,
            timestamp: 'Just now',
            senderId: 'part-teacher-me',
            status: 'DELIVERED',
          },
        };

        const initialMsg: ChatMessage = {
          id: `msg-init-${Date.now()}`,
          conversationId: newConvId,
          senderId: 'system',
          senderName: 'Legacy School Solwezi Portal',
          senderRole: 'ADMIN',
          content: `Direct messaging channel established with ${parent.guardianName} (Guardian of ${parent.studentName}, ${parent.classCohort}). Messages are synced to the Parent Portal.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' CAT',
          status: 'READ',
          isOutgoing: false,
          smartTag: 'ACADEMIC',
        };

        setConversations((prev) => [newConv, ...prev]);
        setMessagesMap((prev) => ({ ...prev, [newConvId]: [initialMsg] }));
        targetConvId = newConvId;
      }
    } else if (type === 'LEARNER') {
      const learner = item as LegacyLearnerBalance;
      const existing = conversations.find(
        (c) => c.pinnedStudent?.studentNumber === learner.studentNumber || c.id === `conv-learner-${learner.studentNumber}`
      );
      if (existing) {
        targetConvId = existing.id;
      } else {
        const initials = learner.learnerName
          .split(' ')
          .map((n: string) => n[0])
          .slice(0, 2)
          .join('');
        const newConvId = `conv-learner-${learner.studentNumber}`;
        const dormDesc = learner.studentType === 'BOARDER' ? learner.currentAccommodation?.dormRoom : 'Day Scholar';
        const newConv: ChatConversation = {
          id: newConvId,
          type: 'DIRECT_LEARNER',
          title: `${learner.learnerName} (${learner.studentNumber})`,
          subtitle: `${learner.className} • ${learner.studentType === 'BOARDER' ? 'Boarder' : 'Day Scholar'}`,
          category: 'LEARNERS',
          participant: {
            id: `part-learner-${learner.studentNumber}`,
            name: learner.learnerName,
            role: 'LEARNER',
            roleTitle: `${learner.className} Learner`,
            avatarText: initials || 'LN',
            avatarBg: 'bg-purple-700',
            phone: learner.guardian.phone,
            online: true,
            associatedLearner: {
              id: learner.studentNumber,
              name: learner.learnerName,
              className: learner.className,
              studentNumber: learner.studentNumber,
              attendanceRate: learner.todayAttendance === 'PRESENT' ? 98.4 : 92.1,
              feeStatus: learner.balance <= 0 ? 'CLEARED' : 'PENDING',
              dormitory: dormDesc,
            },
          },
          pinnedStudent: {
            name: learner.learnerName,
            className: learner.className,
            studentNumber: learner.studentNumber,
            attendanceRate: learner.todayAttendance === 'PRESENT' ? 98.4 : 92.1,
            feeStatus: learner.balance <= 0 ? 'CLEARED' : 'PENDING',
            dormitory: dormDesc,
          },
          unreadCount: 0,
          lastMessage: {
            content: `Learner consultation channel initiated for ${learner.learnerName}.`,
            timestamp: 'Just now',
            senderId: 'part-teacher-me',
            status: 'DELIVERED',
          },
        };

        const initialMsg: ChatMessage = {
          id: `msg-init-${Date.now()}`,
          conversationId: newConvId,
          senderId: 'system',
          senderName: 'Legacy School Solwezi Portal',
          senderRole: 'ADMIN',
          content: `Consultation chat initialized with ${learner.learnerName} (${learner.studentNumber}, ${learner.className}). Messages are audited under School Child Safeguarding policy.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' CAT',
          status: 'READ',
          isOutgoing: false,
          smartTag: 'ACADEMIC',
        };

        setConversations((prev) => [newConv, ...prev]);
        setMessagesMap((prev) => ({ ...prev, [newConvId]: [initialMsg] }));
        targetConvId = newConvId;
      }
    }

    if (targetConvId) {
      setSelectedConvId(targetConvId);
      setMobileChatOpen(true);
      setShowDirectoryModal(false);
    }
  };

  // Handle sending message
  const handleSendMessage = (customText?: string, attachmentData?: any) => {
    const textToSend = customText !== undefined ? customText : inputText.trim();
    if (!textToSend && !attachmentData) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConvId,
      senderId: activePersona === 'TEACHER' ? 'part-teacher-me' : 'part-parent-me',
      senderName:
        activePersona === 'TEACHER'
          ? 'Mr. Emmanuel Chisenga (You)'
          : activePersona === 'PARENT'
          ? 'Mrs. Natasha Mwewa (Parent)'
          : 'School Administration',
      senderRole: activePersona,
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' CAT',
      status: 'SENT',
      isOutgoing: true,
      attachment: attachmentData,
    };

    // Update messages
    setMessagesMap((prev) => ({
      ...prev,
      [selectedConvId]: [...(prev[selectedConvId] || []), newMessage],
    }));

    // Update last message in conversation list
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConvId
          ? {
              ...c,
              lastMessage: {
                content: textToSend || (attachmentData?.name ? `Sent attachment: ${attachmentData.name}` : 'Audio Note'),
                timestamp: 'Just now',
                senderId: newMessage.senderId,
                status: 'DELIVERED',
              },
            }
          : c
      )
    );

    setInputText('');
    setShowTemplates(false);
    setShowAttachMenu(false);

    // Simulate realistic automated reply after 2 seconds
    setTimeout(() => {
      simulateReply(selectedConvId, textToSend);
    }, 2000);
  };

  const simulateReply = (convId: string, previousText: string) => {
    const targetConv = conversations.find((c) => c.id === convId);
    if (!targetConv) return;

    let replyText = 'Thank you for your message. We have received your note and will review it promptly.';
    if (convId === 'conv-1') {
      replyText = 'Zikomo kwambiri Sir! Bupe is ready for class and has his study schedule on hand.';
    } else if (convId === 'conv-2') {
      replyText = 'Acknowledged. The departmental syllabus verification is complete.';
    } else if (convId === 'conv-3') {
      replyText = 'Noted. Housemaster evening roll call roster updated in the system.';
    } else if (targetConv.category === 'LEARNERS') {
      replyText = 'Thank you Teacher, I have received the homework guidelines and will submit my revision notes.';
    } else if (targetConv.category === 'STAFF') {
      replyText = 'Understood colleague. The timetable and marks are aligned with the department schedule.';
    } else if (targetConv.category === 'PARENTS') {
      replyText = 'Received and noted with appreciation. Thank you for keeping us informed of our child.';
    }

    const replyMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: convId,
      senderId: targetConv.participant.id,
      senderName: targetConv.participant.name,
      senderRole: targetConv.participant.role,
      content: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' CAT',
      status: 'READ',
      isOutgoing: false,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] || []), replyMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              lastMessage: {
                content: replyText,
                timestamp: 'Just now',
                senderId: targetConv.participant.id,
                status: 'READ',
              },
            }
          : c
      )
    );
  };

  const handleVoiceNoteSend = () => {
    setIsRecording(false);
    handleSendMessage('', {
      type: 'VOICE_NOTE',
      name: `Voice Memo (${recordSeconds}s)`,
      duration: `0:${recordSeconds < 10 ? '0' : ''}${recordSeconds}`,
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-slate-100 overflow-hidden font-sans">
      {/* Top Banner: Persona Switcher & Zambian School Context */}
      <div className="bg-slate-900 text-white px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-amber-300">Solwezi In-App School Messenger</span>
          <span className="text-slate-400 hidden sm:inline">• Official Teacher, Guardian & Staff Channel</span>
        </div>

        {/* Persona Switcher to demo both sides */}
        <div className="flex items-center gap-2 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
          <span className="text-[11px] text-slate-300 font-medium">Viewing As:</span>
          <button
            onClick={() => setActivePersona('TEACHER')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
              activePersona === 'TEACHER' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Class Teacher
          </button>
          <button
            onClick={() => setActivePersona('PARENT')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
              activePersona === 'PARENT' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Parent / Guardian
          </button>
          <button
            onClick={() => setActivePersona('ADMIN')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
              activePersona === 'ADMIN' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Administration
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDirectoryModal(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2.5 py-1 rounded-md text-[11px] transition shadow-xs"
          >
            <Users className="w-3.5 h-3.5 text-slate-950" />
            <span>School Directory</span>
          </button>
          <Link
            href="/documents"
            className="flex items-center gap-1.5 bg-blue-700/80 hover:bg-blue-700 text-white px-2.5 py-1 rounded-md text-[11px] font-semibold transition"
          >
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>Document Generator</span>
          </Link>
          <Link
            href="/parent"
            className="flex items-center gap-1.5 text-slate-300 hover:text-white text-[11px] transition"
          >
            <HeartHandshake className="w-3.5 h-3.5 text-pink-400" />
            <span>Parent Portal</span>
          </Link>
        </div>
      </div>

      {/* Main Two-Column Chat Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: WhatsApp-Style Conversation List */}
        <div
          className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0 ${
            mobileChatOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* List Header with New Chat / Directory button */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-blue-900 text-amber-300 flex items-center justify-center font-bold text-sm shadow-xs">
                LS
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900">Chats & Notices</h1>
                <p className="text-[10px] text-slate-500">Legacy School Solwezi</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDirectoryModal(true)}
                className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xs transition"
                title="Select users from Staff, Parents, or Learners Directory"
              >
                <UserPlus className="w-3.5 h-3.5 text-amber-300" />
                <span>+ New Chat</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="p-2.5 bg-white border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search messages, parents, or staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Category Tabs: All, Parents, Staff, Learners, Broadcasts */}
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold px-2 py-1.5 gap-1 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition ${
                activeCategory === 'ALL'
                  ? 'bg-blue-900 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Chats
            </button>
            <button
              onClick={() => setActiveCategory('PARENTS')}
              className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap flex items-center gap-1 transition ${
                activeCategory === 'PARENTS'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <HeartHandshake className="w-3 h-3" />
              <span>Parents</span>
            </button>
            <button
              onClick={() => setActiveCategory('STAFF')}
              className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap flex items-center gap-1 transition ${
                activeCategory === 'STAFF'
                  ? 'bg-blue-800 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              <span>Staff Room</span>
            </button>
            <button
              onClick={() => setActiveCategory('LEARNERS')}
              className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap flex items-center gap-1 transition ${
                activeCategory === 'LEARNERS'
                  ? 'bg-purple-800 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <User className="w-3 h-3" />
              <span>Learners</span>
            </button>
            <button
              onClick={() => setActiveCategory('BROADCASTS')}
              className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap flex items-center gap-1 transition ${
                activeCategory === 'BROADCASTS'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Notices</span>
            </button>
          </div>

          {/* Conversation List Stream */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedConvId;
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setSelectedConvId(conv.id);
                    setMobileChatOpen(true);
                  }}
                  className={`p-3 flex items-start gap-3 cursor-pointer transition select-none ${
                    isSelected ? 'bg-blue-50/80 border-l-4 border-blue-900' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className={`w-11 h-11 rounded-full ${conv.participant.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-xs`}
                    >
                      {conv.participant.avatarText}
                    </div>
                    {conv.participant.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-bold text-slate-900 truncate">{conv.title}</h2>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap ml-1">
                        {conv.lastMessage.timestamp}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{conv.subtitle}</p>

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[11px] text-slate-600 truncate flex items-center gap-1">
                        {conv.lastMessage.senderId === 'part-teacher-me' && (
                          <CheckCheck className="w-3 h-3 text-blue-600 shrink-0" />
                        )}
                        <span className="truncate">{conv.lastMessage.content}</span>
                      </p>

                      {conv.unreadCount > 0 && (
                        <span className="ml-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredConversations.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">No conversations match your filter</p>
                <button
                  onClick={() => setShowDirectoryModal(true)}
                  className="mt-3 text-xs text-blue-700 font-bold hover:underline"
                >
                  Open School Directory to Start Chat
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat Room & Pinned Student Context */}
        <div
          className={`flex-1 flex flex-col bg-slate-50 overflow-hidden ${
            mobileChatOpen ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Room Top Bar */}
          <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile Back Button */}
              <button
                onClick={() => setMobileChatOpen(false)}
                className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  className={`w-10 h-10 rounded-full ${activeConversation.participant.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-xs`}
                >
                  {activeConversation.participant.avatarText}
                </div>
                {activeConversation.participant.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                )}
              </div>

              {/* Participant Meta */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 truncate">
                    {activeConversation.participant.name}
                  </h2>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      activeConversation.participant.role === 'PARENT'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : activeConversation.participant.role === 'TEACHER'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : activeConversation.participant.role === 'LEARNER'
                        ? 'bg-purple-100 text-purple-800 border border-purple-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {activeConversation.participant.role}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                  <span>{activeConversation.participant.roleTitle}</span>
                  <span>•</span>
                  <span>{activeConversation.participant.phone}</span>
                  {activeConversation.participant.online ? (
                    <span className="text-emerald-600 font-semibold">• Online</span>
                  ) : (
                    <span>• Last seen {activeConversation.participant.lastSeen || 'Recently'}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Room Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setShowDirectoryModal(true)}
                className="hidden sm:flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-slate-200 transition"
                title="Switch recipient or find user in directory"
              >
                <Users className="w-3.5 h-3.5 text-blue-700" />
                <span>Directory</span>
              </button>
              <a
                href={`tel:${activeConversation.participant.phone}`}
                className="p-2 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition"
                title="Direct Phone Call"
              >
                <Phone className="w-4 h-4" />
              </a>
              <Link
                href="/documents"
                className="hidden sm:flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-900 px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-blue-100 transition"
              >
                <FileText className="w-3.5 h-3.5 text-blue-700" />
                <span>Issue Letter</span>
              </Link>
            </div>
          </div>

          {/* PINNED STUDENT CONTEXT BAR: Critical for Teacher-Parent & Pastoral Clarity */}
          {activeConversation.pinnedStudent && (
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0 shadow-inner">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="font-bold text-amber-200">
                  Discussing: {activeConversation.pinnedStudent.name}
                </span>
                <span className="text-slate-300">({activeConversation.pinnedStudent.className})</span>
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono text-slate-200">
                  {activeConversation.pinnedStudent.studentNumber}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1">
                  <span className="text-slate-300">Attendance:</span>
                  <strong className="text-emerald-400">
                    {activeConversation.pinnedStudent.attendanceRate}%
                  </strong>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-300">Term 3 Fees:</span>
                  <span
                    className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                      activeConversation.pinnedStudent.feeStatus === 'CLEARED'
                        ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/50'
                        : 'bg-amber-500/30 text-amber-300 border border-amber-400/50'
                    }`}
                  >
                    {activeConversation.pinnedStudent.feeStatus}
                  </span>
                </div>
                {activeConversation.pinnedStudent.dormitory && (
                  <div className="hidden lg:flex items-center gap-1 text-slate-300">
                    <Building2 className="w-3 h-3 text-amber-300" />
                    <span>{activeConversation.pinnedStudent.dormitory}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CHAT BUBBLE STREAM (WhatsApp Aesthetic with Wallpaper Feel) */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e5ddd5]/30 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"
          >
            {/* Encryption & Policy Notice */}
            <div className="max-w-md mx-auto bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-2.5 text-center text-[10px] leading-tight shadow-xs">
              <span className="font-bold">🔒 EduSphere Official Communication Channel.</span>
              <p className="mt-0.5 text-amber-800">
                Messages between parents, teachers, learners and staff are logged for student welfare and academic continuity under
                Ministry of Education guidelines.
              </p>
            </div>

            {/* Messages */}
            {activeMessages.map((msg) => {
              const isMe = msg.isOutgoing;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} transition`}
                >
                  {/* Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-md md:max-w-lg rounded-2xl px-3.5 py-2 text-xs shadow-xs ${
                      isMe
                        ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-xs border border-emerald-200/60'
                        : 'bg-white text-slate-900 rounded-tl-xs border border-slate-200'
                    }`}
                  >
                    {/* Sender label in group/staff or broadcast contexts */}
                    {!isMe && (
                      <p className="text-[10px] font-bold text-blue-900 mb-0.5 flex items-center gap-1">
                        <span>{msg.senderName}</span>
                        <span className="text-[9px] font-normal text-slate-400">({msg.senderRole})</span>
                      </p>
                    )}

                    {/* Smart Tag Badge if present */}
                    {msg.smartTag && (
                      <span className="inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.2 mb-1 rounded bg-blue-100 text-blue-800 tracking-wider">
                        #{msg.smartTag}
                      </span>
                    )}

                    {/* Text Body */}
                    {msg.content && <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>}

                    {/* Attachment: Voice Memo */}
                    {msg.attachment?.type === 'VOICE_NOTE' && (
                      <div className="mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-3">
                        <button
                          onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                          className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs hover:bg-emerald-700 transition"
                        >
                          {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>
                        <div className="flex-1">
                          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-emerald-500 rounded-full transition-all duration-300 ${
                                isPlayingAudio ? 'w-3/4' : 'w-1/3'
                              }`}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                            <span>{msg.attachment.name}</span>
                            <span>{msg.attachment.duration || '0:18'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Attachment: Document / PDF / Report Card */}
                    {msg.attachment?.type === 'DOCUMENT' && (
                      <div className="mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0">
                            PDF
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 truncate max-w-[180px]">
                              {msg.attachment.name}
                            </p>
                            <span className="text-[10px] text-slate-500">{msg.attachment.size || '1.2 MB'}</span>
                          </div>
                        </div>
                        <a
                          href={msg.attachment.url || '#'}
                          className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-900 hover:bg-slate-100"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    )}

                    {/* Time & Read Receipts */}
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      {isMe && (
                        <span>
                          {msg.status === 'READ' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-blue-600 inline" />
                          ) : msg.status === 'DELIVERED' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-slate-400 inline" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-slate-400 inline" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* SMART TEMPLATES QUICK TRAY (Zambian School Situations) */}
          {showTemplates && (
            <div className="bg-amber-50/90 border-t border-amber-200 p-3 max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Select Official Pre-Approved Template:</span>
                </span>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="text-xs text-amber-700 hover:underline"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SMART_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => handleSendMessage(tmpl.text)}
                    className="text-left p-2 rounded-lg bg-white border border-amber-200 hover:border-amber-400 hover:shadow-xs transition text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-slate-900 text-[11px]">{tmpl.label}</strong>
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-bold">
                        {tmpl.category}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] line-clamp-2">{tmpl.text}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ATTACHMENT ACTION MENU */}
          {showAttachMenu && (
            <div className="bg-white border-t border-slate-200 p-3 flex items-center gap-4 text-xs">
              <button
                onClick={() => {
                  handleSendMessage('', {
                    type: 'DOCUMENT',
                    name: `Official_Term_Report_${activeConversation.pinnedStudent?.name || 'Pupil'}.pdf`,
                    size: '840 KB',
                  });
                }}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Attach ECZ Report Card</span>
              </button>
              <button
                onClick={() => {
                  handleSendMessage('', {
                    type: 'DOCUMENT',
                    name: 'Kansanshi_Boarding_Rules_2026.pdf',
                    size: '420 KB',
                  });
                }}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium"
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Boarding Guidelines</span>
              </button>
            </div>
          )}

          {/* MESSAGE INPUT DOCK */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
            {/* Attachment Button */}
            <button
              onClick={() => {
                setShowAttachMenu(!showAttachMenu);
                setShowTemplates(false);
              }}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
              title="Attach File or Report"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Smart Templates Button */}
            <button
              onClick={() => {
                setShowTemplates(!showTemplates);
                setShowAttachMenu(false);
              }}
              className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-full transition"
              title="Insert Pre-written Smart Template"
            >
              <Sparkles className="w-5 h-5 text-amber-500" />
            </button>

            {/* Voice Memo Recording State */}
            {isRecording ? (
              <div className="flex-1 flex items-center justify-between bg-red-50 border border-red-200 px-4 py-2 rounded-xl text-xs text-red-700">
                <div className="flex items-center gap-2 font-bold animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  <span>Recording Voice Note... ({recordSeconds}s)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsRecording(false)}
                    className="text-slate-500 hover:text-slate-700 font-semibold text-[11px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVoiceNoteSend}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 rounded-md text-[11px]"
                  >
                    Send Note
                  </button>
                </div>
              </div>
            ) : (
              /* Text Input Field */
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Type a message or select a Zambian greeting above..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
              </div>
            )}

            {/* Send or Voice Record Action */}
            {inputText.trim() ? (
              <button
                onClick={() => handleSendMessage()}
                className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md transition shrink-0"
                title="Send Message"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            ) : (
              <button
                onClick={() => setIsRecording(true)}
                className="w-10 h-10 rounded-full bg-blue-900 hover:bg-blue-800 text-white flex items-center justify-center shadow-md transition shrink-0"
                title="Record Voice Memo"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* INSTITUTIONAL DIRECTORY MODAL: Select from Staff (48), Parents (780), or Learners (780) */}
      {showDirectoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold shadow-md">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Legacy School Solwezi Directory</span>
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                      Live Multi-Campus
                    </span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Start a secure in-app conversation with any verified staff member, parent/guardian, or learner.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDirectoryModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs (Staff 48, Parents 780, Learners 780) */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3 gap-2 shrink-0">
              <button
                onClick={() => {
                  setDirectoryTab('STAFF');
                  setDirectorySearch('');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 ${
                  directoryTab === 'STAFF'
                    ? 'border-blue-700 bg-white text-blue-900 shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-blue-700" />
                <span>Teaching & Operational Staff</span>
                <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">
                  {LEGACY_STAFF_MEMBERS.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setDirectoryTab('PARENTS');
                  setDirectorySearch('');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 ${
                  directoryTab === 'PARENTS'
                    ? 'border-emerald-700 bg-white text-emerald-900 shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <HeartHandshake className="w-4 h-4 text-emerald-700" />
                <span>Parents & Guardians</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">
                  {allParents.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setDirectoryTab('LEARNERS');
                  setDirectorySearch('');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 ${
                  directoryTab === 'LEARNERS'
                    ? 'border-purple-700 bg-white text-purple-900 shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="w-4 h-4 text-purple-700" />
                <span>Enrolled Learners</span>
                <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">
                  {allLearners.length}
                </span>
              </button>
            </div>

            {/* Directory Filter & Search Header */}
            <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={
                    directoryTab === 'STAFF'
                      ? 'Search staff by name, role, department, phone, or email...'
                      : directoryTab === 'PARENTS'
                      ? 'Search parents by guardian name, pupil name, class, or phone...'
                      : 'Search learners by student name, ID (e.g. LS-2026-0042), class cohort...'
                  }
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              {/* Campus Filter */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Campus:</span>
                </span>
                <select
                  value={directoryCampusFilter}
                  onChange={(e) => setDirectoryCampusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                >
                  <option value="ALL">All Campuses</option>
                  <option value="Mushitala">Mushitala Boarding & Day</option>
                  <option value="Urban">Urban Solwezi Central</option>
                </select>

                <span className="text-[11px] text-slate-400 font-medium ml-2">
                  {directoryTab === 'STAFF' && `${filteredStaff.length} Staff`}
                  {directoryTab === 'PARENTS' && `${filteredParents.length} Guardians`}
                  {directoryTab === 'LEARNERS' && `${filteredLearners.length} Pupils`}
                </span>
              </div>
            </div>

            {/* Directory Results List */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 space-y-2.5">
              {/* STAFF TAB RESULTS */}
              {directoryTab === 'STAFF' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredStaff.map((staff) => {
                    const fullName = `${staff.firstName} ${staff.lastName}`;
                    const initials = `${staff.firstName[0]}${staff.lastName[0]}`;
                    return (
                      <div
                        key={staff.id}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-blue-900 text-amber-300 font-bold flex items-center justify-center shrink-0 shadow-xs text-xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xs font-bold text-slate-900 truncate">{fullName}</h3>
                            <p className="text-[11px] font-semibold text-blue-900 truncate">{staff.jobTitle}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                              {staff.departmentLabel} • {staff.campusName}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {staff.phone}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSelectDirectoryContact('STAFF', staff)}
                          className="shrink-0 flex items-center gap-1 bg-blue-900 hover:bg-blue-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition shadow-xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>Chat</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* PARENTS TAB RESULTS */}
              {directoryTab === 'PARENTS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredParents.slice(0, 80).map((parent, idx) => {
                    const initials = parent.guardianName
                      .split(' ')
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join('');
                    return (
                      <div
                        key={`${parent.studentId}-${idx}`}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-emerald-800 text-emerald-100 font-bold flex items-center justify-center shrink-0 shadow-xs text-xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xs font-bold text-slate-900 truncate">
                              {parent.guardianName}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] font-semibold text-emerald-900 truncate">
                                Ward: {parent.studentName}
                              </span>
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                                {parent.studentId}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                              {parent.classCohort} • {parent.campus}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {parent.guardianPhone}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  parent.feeStatus === 'CLEARED'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {parent.feeStatus}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSelectDirectoryContact('PARENT', parent)}
                          className="shrink-0 flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition shadow-xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>Message</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* LEARNERS TAB RESULTS */}
              {directoryTab === 'LEARNERS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredLearners.slice(0, 80).map((learner) => {
                    const initials = learner.learnerName
                      .split(' ')
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join('');
                    const dorm = learner.currentAccommodation?.dormRoom || (learner.studentType === 'BOARDER' ? 'Boarder' : 'Day Scholar');
                    return (
                      <div
                        key={learner.studentNumber}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-purple-400 hover:shadow-md transition flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-purple-900 text-purple-100 font-bold flex items-center justify-center shrink-0 shadow-xs text-xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xs font-bold text-slate-900 truncate">
                              {learner.learnerName}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] font-semibold text-purple-900">
                                {learner.className}
                              </span>
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                                {learner.studentNumber}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                              {learner.campusName} • {dorm}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                              <span>Attendance: {learner.todayAttendance === 'PRESENT' ? '98.4%' : '92.1%'}</span>
                              <span className="text-slate-300">•</span>
                              <span className="truncate">Guardian: {learner.guardian.name}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSelectDirectoryContact('LEARNER', learner)}
                          className="shrink-0 flex items-center gap-1 bg-purple-800 hover:bg-purple-900 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition shadow-xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>Chat</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty Search Fallback */}
              {((directoryTab === 'STAFF' && filteredStaff.length === 0) ||
                (directoryTab === 'PARENTS' && filteredParents.length === 0) ||
                (directoryTab === 'LEARNERS' && filteredLearners.length === 0)) && (
                <div className="p-12 text-center text-slate-400">
                  <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-bold text-slate-600">No matching records found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try adjusting your search keywords or switching the campus filter.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>All communication is archived and verified under Solwezi District MoE compliance.</span>
              </div>
              <button
                onClick={() => setShowDirectoryModal(false)}
                className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
