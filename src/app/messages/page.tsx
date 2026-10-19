// src/app/messages/page.tsx
// WhatsApp-Style Enterprise In-App Messaging Platform for Legacy School Solwezi
// Connecting Teachers, Parents, Boarding Housemasters, and School Leadership
'use client';

import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import {
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  SMART_TEMPLATES,
  ChatConversation,
  ChatMessage,
  MessageRole,
} from '@/server/services/messaging.service';

export default function MessagingPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [selectedConvId, setSelectedConvId] = useState<string>('conv-1');
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'PARENTS' | 'STAFF' | 'BROADCASTS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [activePersona, setActivePersona] = useState<'TEACHER' | 'PARENT' | 'ADMIN'>('TEACHER');
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const matchesCategory =
      activeCategory === 'ALL' ||
      (activeCategory === 'PARENTS' && c.category === 'PARENTS') ||
      (activeCategory === 'STAFF' && c.category === 'STAFF') ||
      (activeCategory === 'BROADCASTS' && c.category === 'BROADCASTS');

    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

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
          <span className="text-slate-400 hidden sm:inline">• Official Teacher & Guardian Channel</span>
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
          {/* List Header */}
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
            <div className="flex items-center gap-1">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                Live Sync
              </span>
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

          {/* Category Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold px-2 py-1.5 gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-3 py-1 rounded-md text-[11px] whitespace-nowrap transition ${
                activeCategory === 'ALL'
                  ? 'bg-blue-900 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Chats
            </button>
            <button
              onClick={() => setActiveCategory('PARENTS')}
              className={`px-3 py-1 rounded-md text-[11px] whitespace-nowrap flex items-center gap-1 transition ${
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
              className={`px-3 py-1 rounded-md text-[11px] whitespace-nowrap flex items-center gap-1 transition ${
                activeCategory === 'STAFF'
                  ? 'bg-blue-800 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              <span>Staff Room</span>
            </button>
            <button
              onClick={() => setActiveCategory('BROADCASTS')}
              className={`px-3 py-1 rounded-md text-[11px] whitespace-nowrap flex items-center gap-1 transition ${
                activeCategory === 'BROADCASTS'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Broadcasts</span>
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
                    <span>• Last seen {activeConversation.participant.lastSeen}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Room Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
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

          {/* PINNED STUDENT CONTEXT BAR: Critical for Teacher-Parent Clarity */}
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
                Messages between parents and teachers are archived for student welfare and academic continuity under
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
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-[11px] text-blue-900 truncate">
                          {msg.senderName}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400">
                          {msg.senderRole}
                        </span>
                      </div>
                    )}

                    {/* Smart Tag if present */}
                    {msg.smartTag && (
                      <div className="mb-1.5">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider ${
                            msg.smartTag === 'ACADEMIC'
                              ? 'bg-blue-100 text-blue-800'
                              : msg.smartTag === 'ATTENDANCE'
                              ? 'bg-amber-100 text-amber-800'
                              : msg.smartTag === 'PASTORAL'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          #{msg.smartTag}
                        </span>
                      </div>
                    )}

                    {/* Text Body */}
                    {msg.content && <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>}

                    {/* Attachments */}
                    {msg.attachment && (
                      <div className="mt-2 bg-black/5 rounded-xl p-2.5 border border-black/10">
                        {msg.attachment.type === 'REPORT_CARD' && (
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-[11px] text-slate-900 truncate">
                                  {msg.attachment.name}
                                </p>
                                <p className="text-[10px] text-slate-500">{msg.attachment.size} • PDF Document</p>
                              </div>
                            </div>
                            <Link
                              href="/academics"
                              className="px-2 py-1 bg-blue-900 text-white rounded text-[10px] font-bold hover:bg-blue-800 transition flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              <span>View</span>
                            </Link>
                          </div>
                        )}

                        {msg.attachment.type === 'VOICE_NOTE' && (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                              className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 hover:bg-emerald-700 transition"
                            >
                              {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </button>
                            <div className="flex-1">
                              <div className="h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full bg-emerald-600 ${
                                    isPlayingAudio ? 'w-2/3 transition-all duration-1000' : 'w-1/3'
                                  }`}
                                />
                              </div>
                              <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                                <span>Voice Memo</span>
                                <span>{msg.attachment.duration}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Timestamp & Status Ticks */}
                    <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 mt-1">
                      <span>{msg.timestamp}</span>
                      {isMe && (
                        <span>
                          {msg.status === 'READ' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                          ) : msg.status === 'DELIVERED' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-slate-400" />
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

          {/* QUICK GREETINGS (Zambian Etiquette & Professional Fast Replies) */}
          <div className="bg-slate-100 px-3 py-1.5 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Quick:
            </span>
            <button
              onClick={() => handleSendMessage('Mwashibukeni! How is the student doing today?')}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-2 py-0.5 rounded-full shrink-0 font-medium"
            >
              Mwashibukeni (Morning)
            </button>
            <button
              onClick={() => handleSendMessage('Mwaboneni. Thank you for following up.')}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-2 py-0.5 rounded-full shrink-0 font-medium"
            >
              Mwaboneni (Afternoon)
            </button>
            <button
              onClick={() => handleSendMessage('Zikomo kwambiri for the prompt update.')}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-2 py-0.5 rounded-full shrink-0 font-medium"
            >
              Zikomo kwambiri
            </button>
            <button
              onClick={() => handleSendMessage('All records have been verified and cleared.')}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-2 py-0.5 rounded-full shrink-0 font-medium"
            >
              Verified & Cleared
            </button>
          </div>

          {/* TEMPLATE PICKER MODAL / POPUP */}
          {showTemplates && (
            <div className="bg-white border-t border-slate-200 p-3 shadow-lg max-h-56 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Smart Academic & Administrative Templates
                </span>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SMART_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      setInputText(tmpl.text);
                      setShowTemplates(false);
                    }}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-900">{tmpl.label}</span>
                      <span className="text-[9px] font-semibold text-blue-700 bg-blue-50 px-1 rounded">
                        {tmpl.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 line-clamp-2 mt-1">{tmpl.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ATTACHMENT MENU POPUP */}
          {showAttachMenu && (
            <div className="bg-white border-t border-slate-200 p-3 shadow-lg flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => {
                  handleSendMessage('Attached official continuous assessment report:', {
                    type: 'REPORT_CARD',
                    name: `${activeConversation.pinnedStudent?.name || 'Student'}_Term3_CA_Summary.pdf`,
                    size: '240 KB',
                  });
                }}
                className="flex items-center gap-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 p-2 rounded-lg text-slate-800 transition"
              >
                <FileText className="w-4 h-4 text-red-600" />
                <span>Attach Academic Report Card</span>
              </button>
              <button
                onClick={() => {
                  handleSendMessage('Attached official school fee invoice for Bursary reconciliation:', {
                    type: 'REPORT_CARD',
                    name: 'Official_Fee_Statement_T3_2026.pdf',
                    size: '120 KB',
                  });
                }}
                className="flex items-center gap-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 p-2 rounded-lg text-slate-800 transition"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Attach Fee Clearance Receipt</span>
              </button>
            </div>
          )}

          {/* BOTTOM COMPOSER (WhatsApp Authentic Bottom Input Bar) */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
            {/* Attachment Button */}
            <button
              onClick={() => {
                setShowAttachMenu(!showAttachMenu);
                setShowTemplates(false);
              }}
              className="p-2 text-slate-500 hover:text-blue-900 hover:bg-slate-100 rounded-full transition"
              title="Attach Document or Assessment"
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
    </div>
  );
}
