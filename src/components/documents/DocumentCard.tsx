import React, { useState } from 'react';
import { DocumentItem } from '../../types';
import { useAuth } from '../../lib/auth-context';
import { StatusBadge } from '../ui/StatusBadge';
import { VisibilityBadge } from '../ui/VisibilityBadge';
import { canApproveDocument } from '../../lib/permissions';
import { approveDocument, downloadDocument } from '../../lib/db';
import { FileText, Download, CheckCircle, AlertCircle, FileCheck } from 'lucide-react';

interface DocumentCardProps {
  document: DocumentItem;
  onRefresh: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onRefresh }) => {
  const { profile, role } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  const canApprove = canApproveDocument(role) && document.status === 'pending_review';

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadMsg(null);
    setDownloadError(null);

    try {
      const res = await downloadDocument(document.id, profile, role);
      setDownloadMsg(`Authorized download verified: ${res.fileName}`);
      setTimeout(() => setDownloadMsg(null), 3000);
    } catch (err: unknown) {
      setDownloadError(err instanceof Error ? err.message : 'Unauthorized download blocked.');
      setTimeout(() => setDownloadError(null), 4000);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleApprove = async () => {
    if (!profile) return;
    setIsApproving(true);
    try {
      await approveDocument(document.id, profile, role);
      onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Approval failed.');
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-slate-300 hover:shadow-xs">
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{document.category}</span>
            <span aria-hidden="true">·</span>
            <span>{formatFileSize(document.file_size)}</span>
          </div>

          <div className="flex items-center gap-2">
            <VisibilityBadge visibility={document.visibility} />
            {document.status !== 'published' && (
              <>
                <span aria-hidden="true">·</span>
                <StatusBadge status={document.status} />
              </>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 mt-0.5">
            <FileText className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 leading-snug">{document.title}</h3>
            {document.description && (
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {document.description}
              </p>
            )}
          </div>
        </div>

        {downloadMsg && (
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 border border-emerald-100">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>{downloadMsg}</span>
          </div>
        )}

        {downloadError && (
          <div className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-800 border border-rose-100">
            <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
            <span>{downloadError}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        <span className="text-[11px] text-slate-400 font-mono">
          Updated {new Date(document.updated_at).toLocaleDateString()}
        </span>

        <div className="flex items-center gap-2">
          {canApprove && (
            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="flex min-h-[36px] items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition disabled:opacity-50"
            >
              <FileCheck className="h-3.5 w-3.5" />
              <span>{isApproving ? 'Approving...' : 'Approve'}</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex min-h-[36px] items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isDownloading ? 'Verifying...' : 'Download'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
