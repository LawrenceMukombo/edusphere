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
  Trash2,
  Share2,
  Reply,
  Star,
  Copy,
  Mic,
  MicOff,
  PhoneOff,
  VideoOff,
  Volume2,
  Play,
  Pause,
  Image as ImageIcon,
  AlertCircle,
  Activity,
} from 'lucide-react';

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
  attachmentSize?: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read' | 'deleted';
  isDeleted?: boolean;
  deletedFor?: string[];
  isEdited?: boolean;
  editedAt?: string;
  isForwarded?: boolean;
  isStarred?: boolean;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  reactions?: {
    emoji: string;
    count: number;
    users: string[];
  }[];
}

export interface ChatConversation {
  id: string;
  title: string;
  type: 'DIRECT' | 'GROUP';
  department?: string;
  avatar?: string;
  isVerified?: boolean;
  isPinned?: boolean;
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
    status: 'sent' | 'delivered' | 'read' | 'deleted';
    isMine?: boolean;
  };
  unreadCount: number;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  department: string;
  staffNumber?: string;
  isOnline?: boolean;
}

interface StagedAttachment {
  name: string;
  size: string;
  type: string;
  url: string;
}

// Must match the server-side allowlist in /api/chat.
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
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

export function PulseChatModule() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>('conv-group-clinical');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inChatSearch, setInChatSearch] = useState<string>('');
  const [showInChatSearch, setShowInChatSearch] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD' | 'GROUPS' | 'STAFF'>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [showNewChatModal, setShowNewChatModal] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState<boolean>(false);
  const [stagedAttachment, setStagedAttachment] = useState<StagedAttachment | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [forwardingMessage, setForwardingMessage] = useState<ChatMessage | null>(null);
  const [forwardSelectedConvs, setForwardSelectedConvs] = useState<string[]>([]);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [activeDropdownMsgId, setActiveDropdownMsgId] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [voiceSeconds, setVoiceSeconds] = useState<number>(0);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<{ title: string; type: 'audio' | 'video' } | null>(null);
  const [isCallMuted, setIsCallMuted] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const discardRecordingRef = useRef<boolean>(false);
  const lastMessageCountRef = useRef<number>(0);

  function showError(message: string) {
    setErrorBanner(message);
    setTimeout(() => setErrorBanner(null), 5000);
  }

  async function postChat(payload: Record<string, unknown>) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      showError('Your session has expired. Please sign in again.');
    } else if (!res.ok || !data.success) {
      showError(data.message || 'NWU Pulse could not complete this action.');
    }
    return { ok: res.ok && data.success, data };
  }

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Live updates: poll the active thread and chat list so messages from other users appear.
  useEffect(() => {
    if (!selectedConvId) return;
    const interval = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      fetchMessages(selectedConvId, true);
      fetchConversations(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedConvId]);

  // Load messages when conversation selection changes
  useEffect(() => {
    if (selectedConvId) {
      fetchMessages(selectedConvId);
      markAsRead(selectedConvId);
      setReplyingTo(null);
      setInChatSearch('');
      setShowInChatSearch(false);
    }
  }, [selectedConvId]);

  // Scroll to bottom only when new messages arrive (not on every poll)
  useEffect(() => {
    if (messages.length !== lastMessageCountRef.current) {
      lastMessageCountRef.current = messages.length;
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);


  // Voice recording timer
  useEffect(() => {
    if (isRecordingVoice) {
      setVoiceSeconds(0);
      voiceTimerRef.current = setInterval(() => {
        setVoiceSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      setVoiceSeconds(0);
    }
    return () => {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    };
  }, [isRecordingVoice]);

  // Teleconsultation call timer
  useEffect(() => {
    if (activeCall) {
      setCallDuration(0);
      setIsCallMuted(false);
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [activeCall]);

  async function fetchConversations(silent = false) {
    try {
      if (!silent) setIsLoading(true);
      const res = await fetch('/api/chat');
      const data = await res.json();
      if (res.ok && data.success) {
        setConversations(data.data.conversations || []);
        setContacts(data.data.contacts || []);
        if (data.data.currentUser?.id) setCurrentUserId(data.data.currentUser.id);
        if (!selectedConvId && data.data.conversations?.length > 0) {
          setSelectedConvId(data.data.conversations[0].id);
        }
      } else if (res.status === 401 && !silent) {
        showError('Your session has expired. Please sign in again.');
      }
    } catch (err) {
      if (!silent) showError('Unable to reach NWU Pulse. Check your connection.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }

  async function fetchMessages(convId: string, silent = false) {
    try {
      const res = await fetch(`/api/chat?conversationId=${encodeURIComponent(convId)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setMessages(data.data.messages || []);
      }
    } catch (err) {
      if (!silent) showError('Unable to load messages.');
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

    // Editing an existing message
    if (editingMessage) {
      const newText = inputText.trim();
      if (!newText) return;
      const { ok, data } = await postChat({
        action: 'EDIT_MESSAGE',
        conversationId: selectedConvId,
        messageId: editingMessage.id,
        text: newText,
      });
      if (ok && data.data) {
        setMessages((prev) => prev.map((m) => (m.id === editingMessage.id ? data.data : m)));
        setEditingMessage(null);
        setInputText('');
      }
      return;
    }

    if (!inputText.trim() && !stagedAttachment) return;

    const textToSend = inputText.trim();
    const attachment = stagedAttachment;
    const replyContext = replyingTo
      ? {
          id: replyingTo.id,
          senderName: replyingTo.senderName,
          text: replyingTo.text.slice(0, 100),
        }
      : undefined;

    setIsSending(true);
    try {
      const { ok, data } = await postChat({
        action: 'SEND_MESSAGE',
        conversationId: selectedConvId,
        text: textToSend || (attachment ? `📎 ${attachment.name}` : ''),
        attachmentName: attachment?.name,
        attachmentUrl: attachment?.url,
        attachmentType: attachment?.type,
        attachmentSize: attachment?.size,
        replyTo: replyContext,
      });

      if (ok) {
        // Only clear the composer once the server has accepted the message.
        setInputText('');
        setStagedAttachment(null);
        setReplyingTo(null);
        setShowEmojiPicker(false);
        setMessages((prev) => [...prev, data.data]);
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
    } catch {
      showError('Message not sent. Check your connection and try again.');
    } finally {
      setIsSending(false);
    }
  }

  async function handleDeleteMessage(msgId: string, scope: 'me' | 'everyone') {
    if (scope === 'everyone' && !window.confirm('Delete this message for everyone?')) return;
    const { ok, data } = await postChat({
      action: 'DELETE_MESSAGE',
      conversationId: selectedConvId,
      messageId: msgId,
      scope,
    });
    if (ok) {
      setMessages((prev) =>
        scope === 'me' ? prev.filter((m) => m.id !== msgId) : prev.map((m) => (m.id === msgId ? data.data : m))
      );
    }
    setActiveDropdownMsgId(null);
  }

  async function handleReactMessage(msgId: string, emoji: string) {
    const { ok, data } = await postChat({
      action: 'REACT_MESSAGE',
      conversationId: selectedConvId,
      messageId: msgId,
      emoji,
    });
    if (ok && data.data) {
      setMessages((prev) => prev.map((m) => (m.id === msgId ? data.data : m)));
    }
  }

  async function handleToggleStar(msgId: string) {
    const { ok, data } = await postChat({
      action: 'TOGGLE_STAR',
      conversationId: selectedConvId,
      messageId: msgId,
    });
    if (ok && data.data) {
      setMessages((prev) => prev.map((m) => (m.id === msgId ? data.data : m)));
    }
    setActiveDropdownMsgId(null);
  }

  async function handleForwardMessage() {
    if (!forwardingMessage || forwardSelectedConvs.length === 0) return;
    const { ok } = await postChat({
      action: 'FORWARD_MESSAGE',
      messageId: forwardingMessage.id,
      fromConversationId: selectedConvId,
      targetConversationIds: forwardSelectedConvs,
    });
    if (ok) {
      setForwardingMessage(null);
      setForwardSelectedConvs([]);
      if (forwardSelectedConvs.includes(selectedConvId)) fetchMessages(selectedConvId);
      fetchConversations(true);
      setCopyFeedback('Forwarded');
      setTimeout(() => setCopyFeedback(null), 2000);
    }
  }

  function formatBytes(bytes: number) {
    return bytes > 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  function stageBlob(blob: Blob, name: string) {
    if (blob.size > MAX_ATTACHMENT_BYTES) {
      showError('Attachments are limited to 5 MB.');
      return;
    }
    const type = (blob.type || '').split(';')[0];
    if (!ALLOWED_TYPES.includes(type)) {
      showError('This file type is not allowed. Use images, PDF, Word, Excel, text or audio.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setStagedAttachment({ name, size: formatBytes(blob.size), type, url: reader.result as string });
      setShowAttachmentMenu(false);
    };
    reader.onerror = () => showError('Could not read the selected file.');
    reader.readAsDataURL(blob);
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    stageBlob(file, file.name);
  }

  async function startVoiceRecording() {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      showError('Voice notes are not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      discardRecordingRef.current = false;
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (discardRecordingRef.current) return;
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const ext = (recorder.mimeType || 'audio/webm').includes('mp4') ? 'm4a' : (recorder.mimeType || '').includes('ogg') ? 'ogg' : 'webm';
        stageBlob(blob, `Voice_note_${new Date().toISOString().replace(/[:.]/g, '-')}.${ext}`);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingVoice(true);
    } catch {
      showError('Microphone access was denied. Allow microphone access to record voice notes.');
    }
  }

  function stopVoiceRecording(discard: boolean) {
    discardRecordingRef.current = discard;
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setIsRecordingVoice(false);
  }

  function handleSendVoiceNote() {
    stopVoiceRecording(false);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopyFeedback('Copied!');
    setTimeout(() => setCopyFeedback(null), 2000);
    setActiveDropdownMsgId(null);
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
          initialMessage: `Hello ${contact.name}, opening direct communication channel via NWU Pulse.`,
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

  const selectedConversation =
    conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      c.title.toLowerCase().includes(q) ||
      (c.department || '').toLowerCase().includes(q);
    if (!matchesSearch) return false;

    if (activeFilter === 'UNREAD') return c.unreadCount > 0;
    if (activeFilter === 'GROUPS') return c.type === 'GROUP';
    if (activeFilter === 'STAFF') return c.type === 'DIRECT';
    return true;
  });

  const displayedMessages = messages.filter((m) => {
    if (!inChatSearch.trim()) return true;
    return m.text.toLowerCase().includes(inChatSearch.toLowerCase());
  });

  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🏥', '🩺', '✅', '⭐'];

  return (
    <div className="flex h-[780px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl relative select-none">
      {/* Hidden File Input for Real Attachments */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
      />

      {/* Copy Toast Feedback */}
      {copyFeedback && (
        <div className="absolute top-4 right-4 z-50 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-lg animate-fade-in">
          {copyFeedback}
        </div>
      )}

      {errorBanner && (
        <div
          role="alert"
          className="absolute top-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg"
        >
          <AlertCircle size={14} /> {errorBanner}
        </div>
      )}

      {/* LEFT SIDEBAR: CONVERSATIONS LIST */}
      <div className="flex w-full sm:w-80 md:w-96 flex-col border-r border-slate-200 bg-[#f0f2f5]">
        {/* Top Header: Brand Name NWU Pulse */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#f0f2f5] p-3 px-4">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-[#00a884] to-teal-700 font-extrabold text-white shadow-sm">
                <Activity size={20} className="text-white animate-pulse" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-xs"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black tracking-tight text-slate-900 leading-tight">
                  NWU Pulse
                </h3>
                <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-emerald-800 tracking-wider">
                  Live
                </span>
              </div>
              <p className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                Clinical & Campus Messenger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowNewChatModal(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-xs hover:bg-emerald-50 hover:text-emerald-700 transition"
              title="New Chat or Channel"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="border-b border-slate-200 bg-white p-2.5 px-3">
          <div className="flex items-center gap-2 rounded-xl bg-[#f0f2f5] px-3 py-1.5 text-xs text-slate-600">
            <Search size={15} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats, preceptors or groups..."
              className="w-full bg-transparent focus:outline-none text-slate-900 text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600"
              >
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
                {f === 'GROUPS' && 'Clinical Groups'}
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
                ? new Date(conv.updatedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-xl font-bold shadow-2xs">
                      {conv.avatar || (conv.type === 'GROUP' ? '🏥' : '👤')}
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
                      {conv.department ||
                        (conv.type === 'GROUP' ? 'Group channel' : 'Direct contact')}
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
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00a884] text-[10px] font-black text-white shadow-2xs">
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-lg font-bold shadow-2xs">
              {selectedConversation?.avatar ||
                (selectedConversation?.type === 'GROUP' ? '🏥' : '👤')}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedConversation?.title}
                </h3>
                {selectedConversation?.isVerified && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                    <ShieldCheck size={11} /> Verified
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {selectedConversation?.type === 'GROUP'
                  ? `${selectedConversation.participants?.length || 4} participants • NWU Pulse Network`
                  : 'Active Now • Official Hospital Network'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-600">
            {/* Search in chat toggle */}
            <button
              onClick={() => setShowInChatSearch(!showInChatSearch)}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                showInChatSearch ? 'bg-slate-300 text-slate-900' : 'hover:bg-slate-200'
              }`}
              title="Search in this conversation"
            >
              <Search size={17} />
            </button>

            {/* Audio Consultation Call */}
            <button
              onClick={() =>
                setActiveCall({
                  title: selectedConversation?.title || 'Teleconsultation',
                  type: 'audio',
                })
              }
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-200 transition"
              title="Start Encrypted Audio Consultation"
            >
              <Phone size={17} />
            </button>

            {/* Video Teleconsultation */}
            <button
              onClick={() =>
                setActiveCall({
                  title: selectedConversation?.title || 'Teleconsultation',
                  type: 'video',
                })
              }
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-200 transition"
              title="Start Encrypted Video Teleconsultation"
            >
              <Video size={17} />
            </button>

            <div className="h-4 w-px bg-slate-300 mx-1"></div>

            {/* Refresh */}
            <button
              onClick={() => fetchMessages(selectedConvId)}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-200 transition"
              title="Refresh messages"
            >
              <Clock size={16} />
            </button>
          </div>
        </div>

        {/* In-Chat Search Bar if active */}
        {showInChatSearch && (
          <div className="flex items-center justify-between border-b border-slate-200 bg-white p-2 px-4 shadow-2xs">
            <div className="flex flex-1 items-center gap-2 text-xs text-slate-600">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                value={inChatSearch}
                onChange={(e) => setInChatSearch(e.target.value)}
                placeholder="Search messages in this thread..."
                className="w-full bg-transparent focus:outline-none text-slate-900 text-xs"
                autoFocus
              />
            </div>
            <span className="text-[11px] text-slate-400 font-medium mr-2">
              {displayedMessages.length} match{displayedMessages.length === 1 ? '' : 'es'}
            </span>
            <button
              onClick={() => {
                setInChatSearch('');
                setShowInChatSearch(false);
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Message Thread History */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3"
          style={{
            backgroundImage: `radial-gradient(#c8ced4 1px, transparent 1px)`,
            backgroundSize: '22px 22px',
          }}
          onClick={() => setActiveDropdownMsgId(null)}
        >
          {/* Institutional Compliance Notice */}
          <div className="mx-auto my-2 max-w-md rounded-lg bg-[#ffeecd] p-2 text-center text-[10px] text-amber-900 shadow-2xs border border-amber-200/80">
            🔒 Messages within NWU Pulse are encrypted and archived under statutory medical regulatory compliance (NMCZ, HPCZ, HEA).
          </div>

          {/* Date Divider */}
          <div className="flex items-center justify-center my-3">
            <span className="rounded-md bg-white px-3 py-1 text-[10px] font-bold text-slate-500 shadow-2xs uppercase tracking-wider">
              Today
            </span>
          </div>

          {displayedMessages.map((msg) => {
            const isMe = Boolean(currentUserId) && msg.senderId === currentUserId;
            const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            const isHovered = hoveredMessageId === msg.id;
            const isDeleted = msg.isDeleted || msg.status === 'deleted';

            return (
              <div
                key={msg.id}
                className={`group relative flex ${isMe ? 'justify-end' : 'justify-start'}`}
                onMouseEnter={() => setHoveredMessageId(msg.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                {/* Hover Action Bar: Emoji reactions, Reply, Forward, Menu */}
                {isHovered && !isDeleted && (
                  <div
                    className={`absolute -top-7 z-20 flex items-center gap-0.5 rounded-full border border-slate-200 bg-white p-1 px-2 shadow-md ${
                      isMe ? 'right-0' : 'left-0'
                    }`}
                  >
                    {/* Quick Reactions */}
                    {['👍', '❤️', '😂', '🙏'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleReactMessage(msg.id, emoji)}
                        className="rounded-full p-1 text-xs hover:scale-125 hover:bg-slate-100 transition"
                      >
                        {emoji}
                      </button>
                    ))}
                    <div className="h-3 w-px bg-slate-200 mx-1"></div>
                    {/* Reply */}
                    <button
                      type="button"
                      onClick={() => setReplyingTo(msg)}
                      className="rounded-full p-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                      title="Reply"
                    >
                      <Reply size={13} />
                    </button>
                    {/* Forward */}
                    <button
                      type="button"
                      onClick={() => {
                        setForwardingMessage(msg);
                        setForwardSelectedConvs([]);
                      }}
                      className="rounded-full p-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                      title="Forward message"
                    >
                      <Share2 size={13} />
                    </button>
                    {/* Star */}
                    <button
                      type="button"
                      onClick={() => handleToggleStar(msg.id)}
                      className={`rounded-full p-1 transition ${
                        msg.isStarred
                          ? 'text-amber-500 hover:bg-amber-50'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                      title={msg.isStarred ? 'Unstar' : 'Star message'}
                    >
                      <Star size={13} fill={msg.isStarred ? 'currentColor' : 'none'} />
                    </button>
                    {/* More Menu Dropdown trigger */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownMsgId(
                            activeDropdownMsgId === msg.id ? null : msg.id
                          );
                        }}
                        className="rounded-full p-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                        title="More options"
                      >
                        <MoreVertical size={13} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeDropdownMsgId === msg.id && (
                        <div className="absolute right-0 top-6 z-30 w-44 rounded-xl border border-slate-200 bg-white p-1 text-xs shadow-xl animate-fade-in">
                          <button
                            onClick={() => copyToClipboard(msg.text)}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-slate-700 hover:bg-slate-100"
                          >
                            <Copy size={13} /> Copy text
                          </button>
                          <button
                            onClick={() => {
                              setForwardingMessage(msg);
                              setActiveDropdownMsgId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-slate-700 hover:bg-slate-100"
                          >
                            <Share2 size={13} /> Forward
                          </button>
                          <button
                            onClick={() => handleToggleStar(msg.id)}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-slate-700 hover:bg-slate-100"
                          >
                            <Star size={13} /> {msg.isStarred ? 'Unstar' : 'Star'}
                          </button>
                          {isMe && !msg.attachmentType?.startsWith('audio/') && (
                            <button
                              onClick={() => {
                                setEditingMessage(msg);
                                setReplyingTo(null);
                                setInputText(msg.text);
                                setActiveDropdownMsgId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-slate-700 hover:bg-slate-100"
                            >
                              <FileText size={13} /> Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMessage(msg.id, 'me')}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={13} /> Delete for me
                          </button>
                          {isMe && (
                            <button
                              onClick={() => handleDeleteMessage(msg.id, 'everyone')}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={13} /> Delete for everyone
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bubble Container */}
                <div
                  className={`relative max-w-md sm:max-w-lg rounded-2xl p-3 px-3.5 shadow-xs text-xs transition ${
                    isMe
                      ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none'
                      : 'bg-white text-slate-900 rounded-tl-none'
                  }`}
                >
                  {/* Forwarded Header Indicator */}
                  {msg.isForwarded && !isDeleted && (
                    <div className="mb-1 flex items-center gap-1 text-[10px] italic font-semibold text-slate-500">
                      <Share2 size={11} className="rotate-180 text-slate-400" />
                      <span>Forwarded</span>
                    </div>
                  )}

                  {/* Sender Name for Group Chats */}
                  {!isMe && !isDeleted && (
                    <div className="mb-1 flex items-center gap-1.5 font-bold text-[#008069] text-[11px]">
                      <span>{msg.senderName}</span>
                      <span className="text-[9px] font-normal text-slate-400">
                        • {msg.senderRole}
                      </span>
                    </div>
                  )}

                  {/* Quoted / Replied Message Preview */}
                  {msg.replyTo && !isDeleted && (
                    <div className="mb-2 rounded-lg border-l-4 border-[#00a884] bg-slate-900/5 p-2 text-[11px]">
                      <p className="font-bold text-[#008069] text-[10px]">
                        {msg.replyTo.senderName}
                      </p>
                      <p className="truncate text-slate-600 text-[10px]">
                        {msg.replyTo.text}
                      </p>
                    </div>
                  )}

                  {/* Attachment Card if present */}
                  {msg.attachmentName && !isDeleted && (
                    <div className="mb-2">
                      {msg.attachmentType?.startsWith('image/') && msg.attachmentUrl ? (
                        <div className="overflow-hidden rounded-xl border border-slate-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={msg.attachmentUrl}
                            alt={msg.attachmentName}
                            className="max-h-60 w-full object-cover"
                          />
                          <div className="flex items-center justify-between bg-white/90 p-2 text-[11px] font-bold text-slate-800">
                            <span className="truncate">{msg.attachmentName}</span>
                            <a
                              href={msg.attachmentUrl}
                              download={msg.attachmentName}
                              className="rounded-lg p-1 text-slate-600 hover:bg-slate-200"
                              title="Download"
                            >
                              <Download size={14} />
                            </a>
                          </div>
                        </div>
                      ) : msg.attachmentType?.startsWith('audio/') && msg.attachmentUrl?.startsWith('data:') ? (
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 p-2 shadow-2xs">
                          <Mic size={16} className="shrink-0 text-emerald-700" />
                          <audio controls preload="metadata" src={msg.attachmentUrl} className="h-8 max-w-[240px]" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white/90 p-2.5 text-xs shadow-2xs">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-bold text-slate-900 text-[11px]">
                              {msg.attachmentName}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {msg.attachmentType?.split('/')[1]?.toUpperCase() || 'File'}
                              {msg.attachmentSize ? ` • ${msg.attachmentSize}` : ''}
                            </p>
                          </div>
                          {msg.attachmentUrl && msg.attachmentUrl !== '#' ? (
                            <a
                              href={msg.attachmentUrl}
                              download={msg.attachmentName}
                              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 transition"
                              title="Download Attachment"
                            >
                              <Download size={15} />
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400" title="No file was uploaded with this message">
                              Not available
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Text (or Deleted State) */}
                  {isDeleted ? (
                    <div className="flex items-center gap-1.5 italic text-slate-500 py-0.5">
                      <AlertCircle size={13} className="text-slate-400" />
                      <span>This message was deleted</span>
                    </div>
                  ) : (
                    <p className="leading-relaxed whitespace-pre-wrap text-[12px]">
                      {msg.text}
                    </p>
                  )}

                  {/* Message Reactions Pills */}
                  {msg.reactions && msg.reactions.length > 0 && !isDeleted && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {msg.reactions.map((r, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleReactMessage(msg.id, r.emoji)}
                          className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold shadow-2xs hover:bg-slate-50 transition"
                          title={`Reacted by: ${r.users.join(', ')}`}
                        >
                          <span>{r.emoji}</span>
                          <span className="text-slate-600">{r.count}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp, Star indicator & Status checks */}
                  <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-500">
                    {msg.isStarred && (
                      <Star size={11} className="text-amber-500" fill="currentColor" />
                    )}
                    {msg.isEdited && !isDeleted && <span className="italic">Edited</span>}
                    <span>{formattedTime}</span>
                    {isMe && !isDeleted && (
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
          {/* Editing Banner */}
          {editingMessage && (
            <div className="mb-2 flex items-center justify-between rounded-xl bg-white p-2 px-3 text-xs border-l-4 border-amber-500 shadow-xs">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-amber-700 text-[11px]">Editing message</p>
                <p className="truncate text-slate-500 text-[10px]">{editingMessage.text}</p>
              </div>
              <button
                onClick={() => {
                  setEditingMessage(null);
                  setInputText('');
                }}
                className="text-slate-400 hover:text-slate-700 p-1"
                aria-label="Cancel editing"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Staged Reply Banner */}
          {replyingTo && (
            <div className="mb-2 flex items-center justify-between rounded-xl bg-white p-2 px-3 text-xs border-l-4 border-[#00a884] shadow-xs">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[#008069] text-[11px]">
                  Replying to {replyingTo.senderName}
                </p>
                <p className="truncate text-slate-500 text-[10px]">{replyingTo.text}</p>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Staged Attachment Banner */}
          {stagedAttachment && (
            <div className="mb-2 flex items-center justify-between rounded-xl bg-white p-2 px-3 text-xs border border-emerald-300 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-bold truncate">
                <FileText size={16} className="shrink-0" />
                <span className="truncate">
                  {stagedAttachment.name} ({stagedAttachment.size})
                </span>
              </div>
              <button
                onClick={() => setStagedAttachment(null)}
                className="text-slate-400 hover:text-slate-700 p-1 shrink-0"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Quick Emoji Picker Drawer */}
          {showEmojiPicker && (
            <div className="mb-2 flex flex-wrap gap-1.5 rounded-xl bg-white p-2 border border-slate-200 shadow-lg animate-fade-in">
              {quickEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setInputText((prev) => prev + emoji);
                  }}
                  className="rounded-lg p-1.5 text-base hover:bg-slate-100 transition"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Attachment Options Drawer */}
          {showAttachmentMenu && (
            <div className="mb-2 flex flex-wrap gap-2 rounded-xl bg-white p-2.5 border border-slate-200 shadow-lg animate-fade-in text-xs font-semibold">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition"
              >
                <ImageIcon size={15} /> Choose Photo or Document from Device
              </button>

              {[
                'Solwezi_Ward_Rotation_Schedule_Nov2026.pdf',
                'NMCZ_Student_Indexing_Summary_2026.pdf',
                'OSCE_Clinical_Skills_Rubric_Grade12.pdf',
              ].map((doc) => (
                <button
                  key={doc}
                  type="button"
                  onClick={() => {
                    setStagedAttachment({
                      name: doc,
                      size: '1.4 MB',
                      type: 'application/pdf',
                      url: '#',
                    });
                    setShowAttachmentMenu(false);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-50 transition"
                >
                  <FileText size={13} className="text-emerald-600" />
                  <span className="truncate max-w-[160px]">{doc}</span>
                </button>
              ))}
            </div>
          )}

          {/* Active Voice Recording Bar OR Standard Input Bar */}
          {isRecordingVoice ? (
            <div className="flex items-center justify-between rounded-xl bg-emerald-950 text-white p-2 px-4 animate-pulse">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-red-500 animate-ping"></span>
                <span className="font-mono font-bold text-xs">
                  Recording audio... 0:
                  {voiceSeconds.toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecordingVoice(false)}
                  className="rounded-lg bg-white/20 px-3 py-1 text-xs font-bold hover:bg-white/30"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendVoiceNote}
                  className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold hover:bg-emerald-400"
                >
                  Send Voice Note
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-1.5 transition ${
                  showEmojiPicker ? 'text-[#00a884]' : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Add Emoji"
              >
                <Smile size={20} />
              </button>

              <button
                type="button"
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                className={`p-1.5 transition ${
                  showAttachmentMenu ? 'text-[#00a884]' : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Attach Document or Image"
              >
                <Paperclip size={20} />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a clinical or academic message..."
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs text-slate-900 shadow-2xs focus:border-[#00a884] focus:outline-none"
              />

              {inputText.trim() || stagedAttachment ? (
                <button
                  type="submit"
                  disabled={isSending}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00a884] text-white shadow-sm hover:bg-[#008f70] transition disabled:opacity-40"
                  title="Send Message"
                >
                  <Send size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsRecordingVoice(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-700 shadow-2xs hover:bg-emerald-100 hover:text-emerald-800 transition"
                  title="Record Voice Note"
                >
                  <Mic size={17} />
                </button>
              )}
            </form>
          )}
        </div>
      </div>

      {/* MODAL: START NEW CHAT OR GROUP */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-[#00a884]" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  New NWU Pulse Communication
                </h3>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Select an active healthcare practitioner or faculty member to initiate an instant encrypted session:
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
                      {c.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{c.name}</h4>
                      <p className="text-[10px] text-slate-500">
                        {c.role} • {c.department}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                    Connect
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FORWARD MESSAGE */}
      {forwardingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Share2 size={16} className="text-[#00a884]" />
                <h3 className="font-extrabold text-sm text-slate-900">Forward Message</h3>
              </div>
              <button
                onClick={() => setForwardingMessage(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quoted Message To Forward */}
            <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700">
              <p className="font-bold text-[10px] text-slate-400 uppercase">Message to Forward</p>
              <p className="truncate mt-0.5">{forwardingMessage.text}</p>
              {forwardingMessage.attachmentName && (
                <p className="text-[10px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                  <FileText size={12} /> {forwardingMessage.attachmentName}
                </p>
              )}
            </div>

            <p className="text-xs text-slate-600 font-semibold mb-2">
              Select one or more chats to forward to:
            </p>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 mb-4">
              {conversations.map((conv) => {
                const isChecked = forwardSelectedConvs.includes(conv.id);
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setForwardSelectedConvs((prev) =>
                        isChecked ? prev.filter((id) => id !== conv.id) : [...prev, conv.id]
                      );
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                      isChecked ? 'bg-emerald-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm font-bold">
                        {conv.avatar || (conv.type === 'GROUP' ? '🏥' : '👤')}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{conv.title}</h4>
                        <p className="text-[10px] text-slate-400">{conv.department}</p>
                      </div>
                    </div>

                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check size={13} />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setForwardingMessage(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={forwardSelectedConvs.length === 0}
                onClick={handleForwardMessage}
                className="flex items-center gap-1.5 rounded-xl bg-[#00a884] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#008f70] transition disabled:opacity-40"
              >
                <Share2 size={14} /> Forward ({forwardSelectedConvs.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CLINICAL AUDIO / VIDEO TELECONSULTATION CALL */}
      {activeCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-3xl font-bold shadow-lg">
                  {activeCall.title[0]}
                </div>
                <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-slate-900 bg-emerald-500 animate-ping"></span>
              </div>
            </div>

            <h3 className="text-base font-extrabold">{activeCall.title}</h3>
            <p className="text-xs text-emerald-400 font-semibold mt-1">
              NWU Pulse Encrypted {activeCall.type === 'video' ? 'Video Telehealth' : 'Audio Call'}
            </p>

            <div className="my-5 rounded-xl bg-slate-800/80 py-2 font-mono text-sm font-bold text-slate-200">
              00:{callDuration.toString().padStart(2, '0')}
            </div>

            {/* In-Call Controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                type="button"
                onClick={() => setIsCallMuted(!isCallMuted)}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                  isCallMuted ? 'bg-red-600 text-white' : 'bg-slate-800 hover:bg-slate-700'
                }`}
                title={isCallMuted ? 'Unmute' : 'Mute'}
              >
                {isCallMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <button
                type="button"
                onClick={() => setActiveCall(null)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition"
                title="End Consultation Call"
              >
                <PhoneOff size={22} />
              </button>

              {activeCall.type === 'video' && (
                <button
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 transition"
                  title="Camera Switch"
                >
                  <Video size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export both names for backwards compatibility
export const WhatsAppChatModule = PulseChatModule;
export default PulseChatModule;
