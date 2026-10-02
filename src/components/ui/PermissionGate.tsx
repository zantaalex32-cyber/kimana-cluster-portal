import React from 'react';
import { useAuth } from '../../lib/auth-context';
import { PermissionCode, RoleType } from '../../types';

interface PermissionGateProps {
  permission?: PermissionCode;
  roles?: RoleType | RoleType[];
  minRole?: RoleType;
  fallback?: React.ReactNode;
  showDenialMessage?: boolean;
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  roles,
  minRole,
  fallback = null,
  showDenialMessage = false,
  children,
}) => {
  const { role, hasPermission, hasRole, isAtLeast } = useAuth();

  let hasAccess = true;

  if (permission && !hasPermission(permission)) {
    hasAccess = false;
  }

  if (roles && !hasRole(roles)) {
    hasAccess = false;
  }

  if (minRole && !isAtLeast(minRole)) {
    hasAccess = false;
  }

  if (!hasAccess) {
    if (showDenialMessage) {
      return (
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-11a4 4 0 00-8 0v4h8V6z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-rose-950">Access Denied</h3>
          <p className="mt-1 text-sm text-rose-700">
            Your current role (<span className="font-semibold">{role}</span>) does not possess the
            required administrative clearance for this section.
          </p>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
