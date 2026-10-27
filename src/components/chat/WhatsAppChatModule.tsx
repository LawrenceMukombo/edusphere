'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Send,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  MoreVertical,
  Phone,
  Video,
  User,
  Users,
  ShieldCheck,
  Plus,
  FileText,
  Download,
  X,
  Clock,
  Sparkles,
  Building2,
  GraduationCap,
  ArrowLeft,
  Filter,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
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

interface Contact {
  id: string;
  name: string;
  role: string;
  department: string;
  staffNumber?: string;
  isOnline?: boolean;
}

export function WhatsAppChatModule() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>('conv-group-clinical');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD' | 'GROUPS' | 'STAFF'>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [showNewChatModal, setShowNewChatModal] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState<boolean>(false);
  const [attachedDocName, setAttachedDocName] = useState<string>('');
  const [callNotice, setCallNotice] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Load messages whenever selected conversation changes
  useEffect(() => {
    if (selectedConvId) {
      fetchMessages(selectedConvId);
      markAsRead(selectedConvId);
    }
  }, [selectedConvId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchConversations() {
    try {
      setIsLoading(true);
      const res = await fetch('/api/chat');
      const data = await res.json();
      if (res.ok && data.success) {
        setConversations(data.data.conversations || []);
        setContacts(data.data.contacts || []);
        if (!selectedConvId && data.data.conversations?.length > 0) {
          setSelectedConvId(data.data.conversations[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchMessages(convId: string) {
    try {
      const res = await fetch(`/api/chat?conversationId=${encodeURIComponent(convId)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setMessages(data.data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }

  async function markAsRead(convId: string) {
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MARK_READ', conversationId: convId }),
      });
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
      );
    } catch {}
  }

  async function handleSendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachedDocName) return;

    const textToSend = inputText.trim();
    const docToSend = attachedDocName;

    setInputText('');
    setAttachedDocName('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SEND_MESSAGE',
          conversationId: selectedConvId,
          text: textToSend || `Shared attachment: ${docToSend}`,
          attachmentName: docToSend || undefined,
          attachmentUrl: docToSend ? '#' : undefined,
          attachmentType: docToSend ? 'application/pdf' : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessages((prev) => [...prev, data.data]);
        // Update last message in conversation list
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConvId
              ? {
                  ...c,
                  lastMessage: {
                    text: data.data.text,
                    senderName: 'You',
                    createdAt: data.data.createdAt,
                    status: 'delivered',
                    isMine: true,
                  },
                  updatedAt: data.data.createdAt,
                }
              : c
          )
        );
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  }

  async function handleStartNewChat(contact: Contact) {
    const existing = conversations.find(
      (c) => c.type === 'DIRECT' && c.participants.some((p) => p.name === contact.name)
    );

    if (existing) {
      setSelectedConvId(existing.id);
      setShowNewChatModal(false);
      return;
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_CONVERSATION',
          title: contact.name,
          type: 'DIRECT',
          participantId: contact.id,
          participantName: contact.name,
          participantRole: contact.role,
          department: contact.department,
          initialMessage: `Hello ${contact.name}, opening communication channel regarding academic & clinical operations.`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setConversations([data.data, ...conversations]);
        setSelectedConvId(data.data.id);
        setShowNewChatModal(false);
      }
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  }

  const selectedConversation = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || c.title.toLowerCase().includes(q) || (c.department || '').toLowerCase().includes(q);
    if (!matchesSearch) return false;

    if (activeFilter === 'UNREAD') return c.unreadCount > 0;
    if (activeFilter === 'GROUPS') return c.type === 'GROUP';
    if (activeFilter === 'STAFF') return c.type === 'DIRECT';
    return true;
  });

  const quickEmojis = ['👍', '🏥', '✅', '🙏', '💉', '🩺', '📚', '🤝', '⚠️', '⭐'];

  return (
    <div className="flex h-[750px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      {/* LEFT SIDEBAR: CONVERSATIONS LIST */}
      <div className="flex w-full sm:w-80 md:w-96 flex-col border-r border-slate-200 bg-[#f0f2f5] select-none">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#f0f2f5] p-3 px-4">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00a884] font-bold text-white shadow-sm">
                NWU
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"></span>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 leading-tight">NWU Campus Chat</h3>
              <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                Official Healthcare Network
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowNewChatModal(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm hover:bg-emerald-50 hover:text-emerald-700 transition"
            title="Start New Direct Chat or Group Channel"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="border-b border-slate-200 bg-white p-2.5 px-3">
          <div className="flex items-center gap-2 rounded-xl bg-[#f0f2f5] px-3 py-1.5 text-xs text-slate-600">
            <Search size={15} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or start new chat..."
              className="w-full bg-transparent focus:outline-none text-slate-900 text-xs"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Filter Tabs */}
          <div className="mt-2 flex gap-1.5 overflow-x-auto no-scrollbar text-[11px] font-bold">
            {(['ALL', 'UNREAD', 'GROUPS', 'STAFF'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`rounded-full px-3 py-1 transition shrink-0 ${
                  activeFilter === f
                    ? 'bg-[#00a884] text-white shadow-xs'
                    : 'bg-[#f0f2f5] text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'ALL' && 'All Chats'}
                {f === 'UNREAD' && 'Unread'}
                {f === 'GROUPS' && 'Groups'}
                {f === 'STAFF' && 'Faculty & Staff'}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations Scroll Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <Users size={32} className="mx-auto mb-2 opacity-40" />
              <p>No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedConvId;
              const formattedTime = conv.updatedAt
                ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`flex cursor-pointer items-center gap-3 p-3 transition ${
                    isSelected ? 'bg-[#f0f2f5]' : 'hover:bg-[#f7f8fa]'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-xl font-bold">
                      {conv.avatar || (conv.type === 'GROUP' ? '👥' : '👤')}
                    </div>
                    {conv.type === 'DIRECT' && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"></span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="truncate text-xs font-bold text-slate-900 flex items-center gap-1">
                        {conv.title}
                        {conv.isVerified && (
                          <ShieldCheck size={13} className="text-[#00a884] shrink-0" />
                        )}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {formattedTime}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {conv.department || (conv.type === 'GROUP' ? 'Group channel' : 'Direct contact')}
                    </p>

                    <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1 truncate text-[11px]">
                        {conv.lastMessage?.isMine && (
                          <CheckCheck size={14} className="text-sky-500 shrink-0" />
                        )}
                        <span className="truncate">
                          {conv.lastMessage?.text || 'No messages yet'}
                        </span>
                      </div>

                      {conv.unreadCount > 0 && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-[10px] font-black text-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT SIDE: ACTIVE CHAT THREAD */}
      <div className="hidden sm:flex flex-1 flex-col bg-[#efeae2]">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#f0f2f5] p-3 px-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-lg font-bold">
              {selectedConversation?.avatar || (selectedConversation?.type === 'GROUP' ? '👥' : '👤')}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900">{selectedConversation?.title}</h3>
                {selectedConversation?.isVerified && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                    <ShieldCheck size={11} /> Verified
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                {selectedConversation?.type === 'GROUP'
                  ? `${selectedConversation.participants?.length || 4} faculty participants`
                  : 'Active Now • Official Campus Network'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <button
              onClick={() => {
                setCallNotice(`Statutory Teleconference Token Generated: NWU-CONF-${Date.now().toString().slice(-4)}`);
                setTimeout(() => setCallNotice(''), 4000);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-200 transition"
              title="Initiate Secure Audio Conference"
            >
              <Phone size={17} />
            </button>
            <button
              onClick={() => {
                setCallNotice(`Clinical Video Telehealth Session Link Generated`);
                setTimeout(() => setCallNotice(''), 4000);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-200 transition"
              title="Start Clinical Skills Video Stream"
            >
              <Video size={17} />
            </button>
            <div className="h-4 w-px bg-slate-300 mx-1"></div>
            <button
              onClick={() => fetchMessages(selectedConvId)}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-200 transition"
              title="Refresh messages"
            >
              <Clock size={16} />
            </button>
          </div>
        </div>

        {callNotice && (
          <div className="bg-emerald-600 text-white text-xs text-center py-1.5 px-4 font-bold flex items-center justify-center gap-2">
            <Sparkles size={14} />
            {callNotice}
          </div>
        )}

        {/* Message Thread History */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3"
          style={{
            backgroundImage: `radial-gradient(#d1d7db 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        >
          {/* Institutional Encryption Notice */}
          <div className="mx-auto my-2 max-w-md rounded-lg bg-[#ffeecd] p-2 text-center text-[10px] text-amber-900 shadow-2xs border border-amber-200/80">
            🔒 Messages within NWUCHAS Campus Chat are securely logged and archived under institutional compliance & statutory council auditing.
          </div>

          {/* Date Divider */}
          <div className="flex items-center justify-center my-3">
            <span className="rounded-md bg-white px-3 py-1 text-[10px] font-bold text-slate-500 shadow-2xs uppercase tracking-wider">
              Today
            </span>
          </div>

          {messages.map((msg) => {
            const isMe = msg.senderRole === 'INSTITUTION_ADMIN' || msg.senderName.includes('Principal') || msg.senderId.includes('usr-principal');
            const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`relative max-w-md sm:max-w-lg rounded-2xl p-3 px-3.5 shadow-xs text-xs ${
                    isMe
                      ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none'
                      : 'bg-white text-slate-900 rounded-tl-none'
                  }`}
                >
                  {/* Sender Name for Group Chats */}
                  {!isMe && (
                    <div className="mb-1 flex items-center gap-1.5 font-bold text-[#008069] text-[11px]">
                      <span>{msg.senderName}</span>
                      <span className="text-[9px] font-normal text-slate-400">• {msg.senderRole}</span>
                    </div>
                  )}

                  {/* Attachment Card if present */}
                  {msg.attachmentName && (
                    <div className="mb-2 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white/80 p-2.5 text-xs">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-slate-900 text-[11px]">{msg.attachmentName}</p>
                        <p className="text-[10px] text-slate-500">Official Clinical Document • 1.4 MB</p>
                      </div>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 transition"
                        title="Download Attachment"
                      >
                        <Download size={15} />
                      </a>
                    </div>
                  )}

                  {/* Message Text */}
                  <p className="leading-relaxed whitespace-pre-wrap text-[12px]">{msg.text}</p>

                  {/* Timestamp & Status */}
                  <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-500">
                    <span>{formattedTime}</span>
                    {isMe && (
                      <CheckCheck size={14} className="text-sky-500" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-slate-200 bg-[#f0f2f5] p-2.5 px-3">
          {attachedDocName && (
            <div className="mb-2 flex items-center justify-between rounded-xl bg-white p-2 px-3 text-xs border border-emerald-300">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <FileText size={16} />
                <span>Attachment: {attachedDocName}</span>
              </div>
              <button onClick={() => setAttachedDocName('')} className="text-slate-400 hover:text-slate-700">
                <X size={15} />
              </button>
            </div>
          )}

          {showEmojiPicker && (
            <div className="mb-2 flex flex-wrap gap-1.5 rounded-xl bg-white p-2 border border-slate-200">
              {quickEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setInputText((prev) => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="rounded-lg p-1 text-base hover:bg-slate-100 transition"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-slate-500 hover:text-slate-700 p-1.5"
              title="Add Emoji"
            >
              <Smile size={20} />
            </button>

            <button
              type="button"
              onClick={() => setShowAttachmentModal(true)}
              className="text-slate-500 hover:text-slate-700 p-1.5"
              title="Attach Document or Report"
            >
              <Paperclip size={20} />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs text-slate-900 shadow-2xs focus:border-[#00a884] focus:outline-none"
            />

            <button
              type="submit"
              disabled={isSending || (!inputText.trim() && !attachedDocName)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00a884] text-white shadow-sm hover:bg-[#008f70] transition disabled:opacity-40"
              title="Send Message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* MODAL: START NEW CHAT */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="font-extrabold text-sm text-slate-900">New Direct Chat / Channel</h3>
              <button onClick={() => setShowNewChatModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Select an active college staff member or faculty lecturer to start an instant encrypted chat:
            </p>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleStartNewChat(c)}
                  className="flex items-center justify-between p-2.5 hover:bg-slate-50 cursor-pointer rounded-xl transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-bold text-xs">
                      {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{c.name}</h4>
                      <p className="text-[10px] text-slate-500">{c.role} • {c.department}</p>
                    </div>
                  </div>

                  <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                    Chat
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ATTACH DOCUMENT */}
      {showAttachmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <h3 className="font-extrabold text-xs text-slate-900">Attach Institutional Document</h3>
              <button onClick={() => setShowAttachmentModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                'Solwezi_Ward_Rotation_Schedule_Nov2026.pdf',
                'NMCZ_Student_Indexing_Summary_2026.pdf',
                'OSCE_Clinical_Skills_Rubric_Grade12.pdf',
                'ZRA_PAYE_Statutory_Schedule_Oct2026.pdf',
              ].map((doc) => (
                <button
                  key={doc}
                  type="button"
                  onClick={() => {
                    setAttachedDocName(doc);
                    setShowAttachmentModal(false);
                  }}
                  className="w-full flex items-center gap-2 rounded-xl border border-slate-200 p-2 text-left hover:border-emerald-500 hover:bg-emerald-50 transition"
                >
                  <FileText size={16} className="text-emerald-700 shrink-0" />
                  <span className="truncate font-medium text-slate-800 text-[11px]">{doc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
