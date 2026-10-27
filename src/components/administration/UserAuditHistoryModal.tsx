// src/components/administration/UserAuditHistoryModal.tsx — Enterprise User Audit Trail & Activity Timeline
'use client';

import { useState, useEffect } from 'react';
import {
  History,
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  LogIn,
  LogOut,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Clock,
  Globe,
  FileText,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

interface AuditEventItem {
  id: string;
  timestamp: string;
  formattedDate: string;
  action: string;
  entityType: string;
  entityId: string;
  actor: string;
  actorEmail: string;
  ipAddress: string;
  details: any;
  isLifecycleEvent: boolean;
}

interface UserAuditHistoryModalProps {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  isOpen: boolean;
  onClose: () => void;
}

export function UserAuditHistoryModal({
  userId,
  userName,
  userEmail,
  userRole,
  isOpen,
  onClose,
}: UserAuditHistoryModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [events, setEvents] = useState<AuditEventItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'LIFECYCLE' | 'LOGIN' | 'OTHER'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !userId) return;

    let mounted = true;
    setLoading(true);
    setError('');

    fetch(`/api/admin/users/${userId}/audit?limit=100`)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setLoading(false);
        if (data.success) {
          setEvents(data.auditTrail || []);
        } else {
          setError(data.message || 'Failed to load user audit history.');
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setLoading(false);
        setError('Error connecting to audit log service.');
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const filteredEvents = events.filter((ev) => {
    if (filterType === 'LIFECYCLE' && !ev.isLifecycleEvent) return false;
    if (filterType === 'LOGIN' && !ev.action.includes('LOGIN')) return false;
    if (filterType === 'OTHER' && (ev.isLifecycleEvent || ev.action.includes('LOGIN'))) return false;

    if (!search) return true;
    const q = search.toLowerCase();
    return (
      ev.action.toLowerCase().includes(q) ||
      ev.actor.toLowerCase().includes(q) ||
      ev.actorEmail.toLowerCase().includes(q) ||
      ev.ipAddress.includes(q) ||
      JSON.stringify(ev.details).toLowerCase().includes(q)
    );
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'SECURITY_LOGIN_SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
            <LogIn size={11} className="text-emerald-600" /> Sign-in Success
          </span>
        );
      case 'SECURITY_LOGIN_FAILED':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-800">
            <ShieldAlert size={11} className="text-rose-600" /> Sign-in Failed
          </span>
        );
      case 'USER_PASSWORD_RESET':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-800">
            <KeyRound size={11} className="text-indigo-600" /> Password Reset
          </span>
        );
      case 'USER_SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
            <UserX size={11} className="text-amber-600" /> Account Suspended
          </span>
        );
      case 'USER_LOCKED':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-800">
            <Lock size={11} className="text-rose-600" /> Security Locked
          </span>
        );
      case 'USER_REACTIVATED':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800">
            <UserCheck size={11} className="text-teal-600" /> Account Reactivated
          </span>
        );
      case 'USER_SOFT_DELETED':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-800">
            <X size={11} className="text-slate-600" /> Soft-Deleted / Archived
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-700">
            <FileText size={11} className="text-slate-500" /> {action}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-800">
              <History size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900">User Audit History & Security Timeline</h3>
                <span className="rounded-md border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[10px] font-extrabold text-cyan-800">
                  {userRole}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {userName} • <span className="font-mono text-slate-600">{userEmail}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="border-b border-slate-100 bg-white px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit actions, IP, actor…"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-slate-400 mr-1" />
            {(['ALL', 'LIFECYCLE', 'LOGIN', 'OTHER'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilterType(f)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                  filterType === f
                    ? 'bg-cyan-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'ALL' ? `All (${events.length})` : f}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <RefreshCw className="h-8 w-8 animate-spin text-cyan-700 mb-2" />
              <p className="text-xs font-semibold">Retrieving immutable audit trail from database…</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Audit Service Notice</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <History size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-600">No matching audit events recorded</p>
              <p className="text-[11px] text-slate-400 mt-1">Actions performed by or on this user will appear here.</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {filteredEvents.map((ev) => {
                const isExpanded = expandedId === ev.id;
                return (
                  <div key={ev.id} className="relative group">
                    {/* Timeline bullet dot */}
                    <div className="absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-cyan-600 ring-2 ring-cyan-100" />

                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-cyan-300 transition">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {getActionBadge(ev.action)}
                          <span className="font-mono text-[11px] text-slate-500">{ev.action}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <Clock size={11} /> {ev.formattedDate}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <span className="text-slate-400 font-semibold">Actor:</span>
                          <span className="font-bold">{ev.actor}</span>
                          <span className="text-slate-400 font-mono text-[10px]">({ev.actorEmail})</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                          <Globe size={11} className="text-slate-400" />
                          <span>{ev.ipAddress}</span>
                        </div>
                      </div>

                      {/* Detail Payload Summary */}
                      {ev.details && Object.keys(ev.details).length > 0 && (
                        <div className="mt-2.5 border-t border-slate-100 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-600">
                              {ev.details.reason ? (
                                <span>
                                  Reason: <strong className="text-slate-800">{ev.details.reason}</strong>
                                </span>
                              ) : ev.details.newStatus ? (
                                <span>
                                  Status changed to: <strong>{ev.details.newStatus}</strong>
                                </span>
                              ) : ev.details.resetMode ? (
                                <span>Reset mode: <strong>{ev.details.resetMode}</strong> (Forced rotation on next login)</span>
                              ) : (
                                <span className="text-slate-400">Payload details recorded</span>
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                              className="text-[10px] font-bold text-cyan-700 hover:underline cursor-pointer"
                            >
                              {isExpanded ? 'Hide Raw Details' : 'View Raw Details'}
                            </button>
                          </div>

                          {isExpanded && (
                            <pre className="mt-2 p-2.5 rounded-lg bg-slate-900 text-slate-200 text-[10px] font-mono overflow-x-auto max-h-40">
                              {JSON.stringify(ev.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 font-medium">
            Total verified audit events: <strong>{events.length}</strong>
          </span>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
}
