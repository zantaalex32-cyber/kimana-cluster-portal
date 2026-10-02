import React, { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { PermissionGate } from '../../components/ui/PermissionGate';
import {
  PRIMARY_CLUSTER_ID,
  approveAccessRequest,
  getAccessRequests,
  getLocalities,
  rejectAccessRequest,
} from '../../lib/db';
import { AccessRequest, RoleType } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Search, UserCheck, UserX, Clock, ArrowLeft, AlertCircle, Check } from 'lucide-react';

interface AdminAccessRequestsPageProps {
  onNavigate: (path: string) => void;
}

export const AdminAccessRequestsPage: React.FC<AdminAccessRequestsPageProps> = ({ onNavigate }) => {
  const { profile, role, cluster } = useAuth();
  const localities = getLocalities(cluster?.id || PRIMARY_CLUSTER_ID, profile || undefined, role);

  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('pending');

  // Selected request modal / action state
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [assignedRole, setAssignedRole] = useState<RoleType>('member');
  const [assignedLocality, setAssignedLocality] = useState<string>('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  let requests: AccessRequest[] = [];
  try {
    requests = getAccessRequests(profile, role);
  } catch (err) {
    console.error('Failed to load access requests', err);
  }

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenReview = (req: AccessRequest) => {
    setSelectedRequest(req);
    setAssignedRole(req.assigned_role || 'member');
    setAssignedLocality(req.locality_id || (localities[0]?.id || ''));
    setReviewNotes(req.review_notes || '');
    setActionError(null);
    setActionSuccess(null);
  };

  const handleApprove = async () => {
    if (!selectedRequest || !profile) return;
    setIsProcessing(true);
    setActionError(null);

    try {
      await approveAccessRequest({
        requestId: selectedRequest.id,
        actor: profile,
        actorRole: role,
        assignedRole,
        assignedLocalityId: assignedLocality,
        reviewNotes,
      });

      setActionSuccess(`Access approved for ${selectedRequest.full_name} as ${assignedRole}.`);
      setRefreshKey((k) => k + 1);
      setTimeout(() => {
        setSelectedRequest(null);
        setActionSuccess(null);
      }, 1500);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Approval failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !profile) return;
    if (!reviewNotes.trim()) {
      setActionError('Please provide a reason or review notes for rejection.');
      return;
    }

    setIsProcessing(true);
    setActionError(null);

    try {
      await rejectAccessRequest({
        requestId: selectedRequest.id,
        actor: profile,
        actorRole: role,
        reviewNotes,
      });

      setActionSuccess(`Access request rejected for ${selectedRequest.full_name}.`);
      setRefreshKey((k) => k + 1);
      setTimeout(() => {
        setSelectedRequest(null);
        setActionSuccess(null);
      }, 1500);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Rejection failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PermissionGate minRole="cluster_admin" showDenialMessage>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6" key={refreshKey}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => onNavigate('/admin')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Admin</span>
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Access Requests Workflow
            </h1>
            <p className="text-xs text-slate-500">
              Review, verify locality affiliation, and grant approved role access to community applicants.
            </p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-1.5 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            {['pending', 'approved', 'rejected', 'all'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                  filterStatus === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          {filteredRequests.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-800">No requests found</p>
              <p>No access requests match the current search or status filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRequests.map((req) => {
                const loc = localities.find((l) => l.id === req.locality_id);
                return (
                  <div
                    key={req.id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{req.full_name}</span>
                        <StatusBadge status={req.status} />
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500 font-mono">{req.email}</span>
                      </div>

                      <div className="text-xs text-slate-600">
                        <span className="font-medium text-slate-700">Locality:</span>{' '}
                        {loc?.name || 'Unassigned'}
                        {req.phone && (
                          <>
                            <span className="mx-2 text-slate-300">·</span>
                            <span className="font-medium text-slate-700">Phone:</span> {req.phone}
                          </>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 max-w-3xl">
                        &ldquo;{req.reason}&rdquo;
                      </p>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                        <Clock className="h-3 w-3" />
                        <span>Submitted {new Date(req.created_at).toLocaleDateString()}</span>
                        {req.reviewed_at && (
                          <>
                            <span>·</span>
                            <span>Reviewed {new Date(req.reviewed_at).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {req.status === 'pending' ? (
                        <button
                          onClick={() => handleOpenReview(req)}
                          className="min-h-[40px] rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 transition"
                        >
                          Review & Action
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenReview(req)}
                          className="min-h-[40px] rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Review Access Request: {selectedRequest.full_name}
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                Close
              </button>
            </div>

            {actionError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            {actionSuccess && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-start gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{actionSuccess}</span>
              </div>
            )}

            <div className="space-y-3 text-xs text-slate-700">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 space-y-1">
                <div>
                  <strong>Email:</strong> {selectedRequest.email}
                </div>
                <div>
                  <strong>Phone:</strong> {selectedRequest.phone || 'None provided'}
                </div>
                <div>
                  <strong>Reason:</strong> {selectedRequest.reason}
                </div>
              </div>

              {selectedRequest.status === 'pending' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Assign Role</label>
                      <select
                        value={assignedRole}
                        onChange={(e) => setAssignedRole(e.target.value as RoleType)}
                        className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                      >
                        <option value="member">Cluster Member</option>
                        <option value="coordinator">Activity Coordinator</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Assign Locality</label>
                      <select
                        value={assignedLocality}
                        onChange={(e) => setAssignedLocality(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                      >
                        {localities.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Reviewer Notes (Recorded in Audit Log)
                    </label>
                    <textarea
                      rows={2}
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="e.g. Verified with Namelok community coordinator; approved as active member."
                      className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleReject}
                      className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
                    >
                      <UserX className="h-3.5 w-3.5" />
                      <span>Reject Request</span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleApprove}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 transition disabled:opacity-50"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Approve Access</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-2 pt-2">
                  <p>
                    <strong>Current Status:</strong> <StatusBadge status={selectedRequest.status} />
                  </p>
                  <p>
                    <strong>Assigned Role:</strong> {selectedRequest.assigned_role || 'None'}
                  </p>
                  <p>
                    <strong>Review Notes:</strong> {selectedRequest.review_notes || 'None'}
                  </p>
                  <div className="flex justify-end pt-3">
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-xs text-white"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PermissionGate>
  );
};
