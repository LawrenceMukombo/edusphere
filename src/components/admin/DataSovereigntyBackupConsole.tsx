// src/components/admin/DataSovereigntyBackupConsole.tsx
// Enterprise No-Vendor-Lock-In Local Backup & Disaster Recovery Console
'use client';

import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Database,
  ShieldCheck,
  RefreshCw,
  FileSpreadsheet,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  exportBackupToJsonString,
  exportBackupToSqlDump,
  validateBackupArchive,
  executeBackupRestoration,
  triggerBrowserDownload,
  BackupValidationResult,
  BackupManifest,
} from '@/server/services/backupRestore.service';

export function DataSovereigntyBackupConsole() {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<BackupValidationResult | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showStatus = (type: 'success' | 'error' | 'info', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 6000);
  };

  // 1. Export JSON
  const handleExportJson = async () => {
    try {
      setIsExporting('json');
      const jsonStr = await exportBackupToJsonString();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      triggerBrowserDownload(jsonStr, `edusphere_backup_legacy_school_${timestamp}.json`, 'application/json');
      showStatus('success', 'Full system JSON backup generated and downloaded successfully.');
    } catch (err: any) {
      showStatus('error', `Failed to generate backup: ${err.message}`);
    } finally {
      setIsExporting(null);
    }
  };

  // 2. Export ANSI SQL
  const handleExportSql = async () => {
    try {
      setIsExporting('sql');
      const sqlStr = await exportBackupToSqlDump();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      triggerBrowserDownload(sqlStr, `edusphere_sql_dump_legacy_school_${timestamp}.sql`, 'application/sql');
      showStatus('success', 'ANSI SQL database dump generated and downloaded successfully.');
    } catch (err: any) {
      showStatus('error', `Failed to generate SQL dump: ${err.message}`);
    } finally {
      setIsExporting(null);
    }
  };

  // 3. Handle File Selection for Restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      setSelectedFileContent(content);
      const val = await validateBackupArchive(content);
      setValidationResult(val);
      if (val.isValid) {
        showStatus('info', `Verified valid EduSphere archive: ${val.manifest?.totalRecordsCount} records ready for restoration.`);
      } else {
        showStatus('error', val.error || 'Invalid backup archive.');
      }
    };
    reader.readAsText(file);
  };

  // 4. Execute Restore
  const handleExecuteRestore = async () => {
    if (!selectedFileContent || !validationResult?.isValid) return;

    const confirmed = confirm(
      `CONFIRM DISASTER RECOVERY RESTORATION:\n\n` +
      `You are about to restore system state from backup: "${validationResult.manifest?.schoolName}" (${validationResult.manifest?.exportedAtCAT}).\n\n` +
      `This will safely synchronize configuration, security settings, and registers. Proceed?`
    );

    if (!confirmed) return;

    try {
      setIsRestoring(true);
      const res = await executeBackupRestoration(selectedFileContent);
      showStatus('success', res.message);
      setSelectedFileContent(null);
      setValidationResult(null);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      showStatus('error', `Restoration failed: ${err.message}`);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white border border-blue-900 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">Institutional Data Sovereignty & Local Backups</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Zero Vendor Lock-In
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Full database export and independent restoration compliant with Section 38 of the Zambia Data Protection Act 2021.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-slate-200 border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Cryptographic SHA-256 Validated
            </span>
          </div>
        </div>
      </div>

      {/* Status Message Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in-50 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          {statusMessage.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
          {statusMessage.type === 'info' && <RefreshCw className="w-4 h-4 text-blue-600 shrink-0 animate-spin" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Grid: 1. Export Section & 2. Restore Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PANEL 1: BACKUP CREATION & DOWNLOAD */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Create & Download Local Backup</h3>
                <p className="text-xs text-slate-500">
                  Export complete operational datasets without third-party dependencies.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-700" />
                    Standard JSON Archive (Recommended)
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                    Universal Portable
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Complete human-readable package including students, finances, assets, staff, and policies with embedded SHA-256 manifest.
                </p>
                <button
                  type="button"
                  onClick={handleExportJson}
                  disabled={isExporting !== null}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isExporting === 'json' ? 'Generating JSON Archive...' : 'Download Full System Backup (.json)'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-purple-700" />
                    ANSI SQL / SQLite Dump
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                    Direct DB Migration
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Standard SQL DDL `CREATE TABLE` and `INSERT INTO` statements ready to execute in PostgreSQL, SQLite, or MySQL.
                </p>
                <button
                  type="button"
                  onClick={handleExportSql}
                  disabled={isExporting !== null}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isExporting === 'sql' ? 'Generating SQL Dump...' : 'Download ANSI SQL Dump (.sql)'}
                </button>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Data Privacy Note:</strong> Local backups contain personal learner and financial records. Store them on an encrypted institutional drive or secure school server.
            </span>
          </div>
        </div>

        {/* PANEL 2: RESTORATION & DISASTER RECOVERY */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-900 flex items-center justify-center font-bold">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Restore System State from Backup</h3>
                <p className="text-xs text-slate-500">
                  Non-destructive recovery with cryptographic checksum & dry-run validation.
                </p>
              </div>
            </div>

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-700 bg-slate-50/60 rounded-xl p-5 text-center cursor-pointer transition"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.sql"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">
                {fileName ? fileName : 'Click to select or drag and drop your .json backup file'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Supports verified EduSphere Sovereign Archives v1.0.0
              </p>
            </div>

            {/* Validation & Dry-Run Preview Card */}
            {validationResult && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-3 ${
                  validationResult.isValid
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center justify-between border-b pb-2 border-current/10">
                  <span className="font-bold flex items-center gap-1.5">
                    {validationResult.isValid ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Valid Archive Manifest Verified
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Archive Validation Failed
                      </>
                    )}
                  </span>
                  {validationResult.manifest && (
                    <span className="font-mono text-[10px] bg-white/70 px-2 py-0.5 rounded border border-current/20">
                      v{validationResult.manifest.schemaVersion}
                    </span>
                  )}
                </div>

                {validationResult.isValid && validationResult.manifest ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Institution:</span>
                        <strong className="text-slate-900">{validationResult.manifest.schoolName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Created At:</span>
                        <strong className="text-slate-900">{validationResult.manifest.exportedAtCAT}</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/60">
                      <span className="font-bold block text-[11px] mb-1">Entity Record Counts to Restore:</span>
                      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                        {Object.entries(validationResult.recordSummary || {}).map(([key, count]) => (
                          <div key={key} className="bg-white/80 p-1.5 rounded border border-emerald-100">
                            <span className="text-slate-500 block">{key}</span>
                            <span className="font-bold text-emerald-800">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-rose-700">{validationResult.error}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              disabled={!validationResult?.isValid || isRestoring}
              onClick={handleExecuteRestore}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
              {isRestoring ? 'Applying Restored State...' : 'Confirm & Execute System Restoration'}
            </button>
          </div>
        </div>
      </div>

      {/* Statutory Data Portability Guarantee */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-blue-900 shrink-0" />
          <span className="text-slate-600">
            <strong>Open Format Assurance:</strong> All backups exported from EduSphere can be extracted without proprietary software. You own your school data at all times.
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-500 shrink-0">
          Zambia DPA 2021 Compliant
        </span>
      </div>
    </div>
  );
}
