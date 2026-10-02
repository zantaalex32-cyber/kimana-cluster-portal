import { AuditLog, RoleType } from '../types';

const AUDIT_STORAGE_KEY = 'kimana_audit_logs_v1';

export function getStoredAuditLogs(): AuditLog[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredAuditLogs(logs: AuditLog[]) {
  try {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to persist audit log', e);
  }
}

export interface RecordAuditParams {
  userId?: string;
  userName?: string;
  userRole?: RoleType;
  clusterId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export function recordAuditLog(params: RecordAuditParams): AuditLog {
  const newLog: AuditLog = {
    id: 'aud-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now(),
    user_id: params.userId,
    user_name: params.userName || (params.userId ? 'Authenticated User' : 'System'),
    user_role: params.userRole,
    cluster_id: params.clusterId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    metadata: params.metadata,
    created_at: new Date().toISOString(),
  };

  const logs = getStoredAuditLogs();
  logs.unshift(newLog);
  // Cap stored logs to 500 entries for client safety
  if (logs.length > 500) {
    logs.length = 500;
  }
  saveStoredAuditLogs(logs);

  return newLog;
}
