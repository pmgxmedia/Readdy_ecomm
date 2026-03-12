import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';

type AdminRole = 'Super Admin' | 'Editor' | 'Viewer';

interface RoleEntry {
  id: string;
  user_id: string;
  role: AdminRole;
  created_at: string;
  updated_at: string;
  email?: string;
  full_name?: string;
}

const ROLES: AdminRole[] = ['Super Admin', 'Editor', 'Viewer'];

const EDGE_FN = 'https://vzrkvyuouwvrwvcmiozq.supabase.co/functions/v1/admin-role-management';

type PermissionLevel = 'full' | 'read' | 'none';

interface PermissionRow {
  section: string;
  page: string;
  icon: string;
  permissions: Record<AdminRole, PermissionLevel>;
}

const PERMISSIONS_MATRIX: { group: string; groupIcon: string; rows: PermissionRow[] }[] = [
  {
    group: 'Dashboard',
    groupIcon: 'ri-dashboard-line',
    rows: [
      {
        section: 'Dashboard',
        page: 'Overview & Analytics',
        icon: 'ri-bar-chart-2-line',
        permissions: { 'Super Admin': 'full', Editor: 'read', Viewer: 'read' },
      },
    ],
  },
  {
    group: 'Content',
    groupIcon: 'ri-layout-line',
    rows: [
      { section: 'Content', page: 'Hero Section', icon: 'ri-image-line', permissions: { 'Super Admin': 'full', Editor: 'full', Viewer: 'read' } },
      { section: 'Content', page: 'Featured Products', icon: 'ri-star-line', permissions: { 'Super Admin': 'full', Editor: 'full', Viewer: 'read' } },
      { section: 'Content', page: 'New Arrivals', icon: 'ri-price-tag-3-line', permissions: { 'Super Admin': 'full', Editor: 'full', Viewer: 'read' } },
      { section: 'Content', page: 'Popular Products', icon: 'ri-fire-line', permissions: { 'Super Admin': 'full', Editor: 'full', Viewer: 'read' } },
      { section: 'Content', page: 'Recommended', icon: 'ri-thumb-up-line', permissions: { 'Super Admin': 'full', Editor: 'full', Viewer: 'read' } },
      { section: 'Content', page: 'Categories', icon: 'ri-grid-line', permissions: { 'Super Admin': 'full', Editor: 'full', Viewer: 'read' } },
      { section: 'Content', page: 'Announcement Bar', icon: 'ri-megaphone-line', permissions: { 'Super Admin': 'full', Editor: 'full', Viewer: 'read' } },
      { section: 'Content', page: 'Promotional Banner', icon: 'ri-percent-line', permissions: { 'Super Admin': 'full', Editor: 'full', Viewer: 'read' } },
      { section: 'Content', page: 'Price History', icon: 'ri-line-chart-line', permissions: { 'Super Admin': 'full', Editor: 'full', Viewer: 'read' } },
      { section: 'Content', page: 'Footer', icon: 'ri-layout-bottom-line', permissions: { 'Super Admin': 'full', Editor: 'full', Viewer: 'read' } },
    ],
  },
  {
    group: 'Orders',
    groupIcon: 'ri-shopping-bag-line',
    rows: [
      { section: 'Orders', page: 'Order Management', icon: 'ri-file-list-3-line', permissions: { 'Super Admin': 'full', Editor: 'full', Viewer: 'read' } },
      { section: 'Orders', page: 'Payments', icon: 'ri-bank-card-line', permissions: { 'Super Admin': 'full', Editor: 'read', Viewer: 'read' } },
    ],
  },
  {
    group: 'Checkout',
    groupIcon: 'ri-shopping-cart-line',
    rows: [
      { section: 'Checkout', page: 'Checkout Settings', icon: 'ri-settings-3-line', permissions: { 'Super Admin': 'full', Editor: 'none', Viewer: 'none' } },
    ],
  },
  {
    group: 'Settings',
    groupIcon: 'ri-settings-line',
    rows: [
      { section: 'Settings', page: 'Store Settings', icon: 'ri-store-2-line', permissions: { 'Super Admin': 'full', Editor: 'none', Viewer: 'none' } },
      { section: 'Settings', page: 'Navbar Settings', icon: 'ri-menu-line', permissions: { 'Super Admin': 'full', Editor: 'none', Viewer: 'none' } },
      { section: 'Settings', page: 'Currency Settings', icon: 'ri-currency-line', permissions: { 'Super Admin': 'full', Editor: 'none', Viewer: 'none' } },
      { section: 'Settings', page: 'User Profile', icon: 'ri-user-settings-line', permissions: { 'Super Admin': 'full', Editor: 'full', Viewer: 'full' } },
      { section: 'Settings', page: 'Role Management', icon: 'ri-shield-user-line', permissions: { 'Super Admin': 'full', Editor: 'read', Viewer: 'read' } },
    ],
  },
];

const PERMISSION_CONFIG: Record<PermissionLevel, { label: string; icon: string; cellBg: string; iconColor: string; badgeText: string }> = {
  full: { label: 'Full Access', icon: 'ri-checkbox-circle-fill', cellBg: 'bg-teal-50/60', iconColor: 'text-teal-500', badgeText: 'text-teal-700' },
  read: { label: 'View Only', icon: 'ri-eye-line', cellBg: 'bg-amber-50/60', iconColor: 'text-amber-400', badgeText: 'text-amber-700' },
  none: { label: 'No Access', icon: 'ri-close-circle-fill', cellBg: 'bg-gray-50/80', iconColor: 'text-gray-300', badgeText: 'text-gray-400' },
};

const ROLE_META: Record<AdminRole, { bg: string; text: string; border: string; icon: string; desc: string }> = {
  'Super Admin': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', icon: 'ri-shield-star-line', desc: 'Full access — can manage roles, settings, content, and orders.' },
  Editor: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'ri-edit-2-line', desc: 'Can edit content and manage orders. Cannot change roles or settings.' },
  Viewer: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', icon: 'ri-eye-line', desc: 'Read-only access. Cannot make any changes.' },
};

const AVATAR_COLORS = [
  'from-teal-400 to-teal-600',
  'from-violet-400 to-violet-600',
  'from-rose-400 to-rose-600',
  'from-amber-400 to-amber-600',
  'from-sky-400 to-sky-600',
  'from-emerald-400 to-emerald-600',
];

function getAvatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function RoleManagementPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<AdminRole | null>(null);
  const [entries, setEntries] = useState<RoleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [matrixExpanded, setMatrixExpanded] = useState(true);

  // Add Admin modal
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AdminRole>('Editor');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [lookupResult, setLookupResult] = useState<{ user_id: string; email: string; full_name: string } | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  // Confirm remove modal
  const [confirmRemove, setConfirmRemove] = useState<RoleEntry | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const getAuthHeader = async (): Promise<string> => {
    const { data } = await supabase.auth.getSession();
    return `Bearer ${data.session?.access_token ?? ''}`;
  };

  const callEdgeFn = async (body: Record<string, unknown>) => {
    const authHeader = await getAuthHeader();
    const res = await fetch(EDGE_FN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader },
      body: JSON.stringify(body),
    });
    return res.json();
  };

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_roles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      showToast('error', 'Failed to load role entries.');
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as RoleEntry[];

    // If any row is missing email/full_name, try to enrich via edge function
    const needsEnrich = rows.some((r) => !r.email);
    if (needsEnrich) {
      try {
        const result = await callEdgeFn({ action: 'list_users_metadata' });
        if (result.users) {
          const metaMap: Record<string, { email: string; full_name: string }> = {};
          for (const u of result.users) metaMap[u.user_id] = u;
          const enriched = rows.map((r) => ({
            ...r,
            email: r.email || metaMap[r.user_id]?.email || '',
            full_name: r.full_name || metaMap[r.user_id]?.full_name || '',
          }));
          setEntries(enriched);
          setLoading(false);
          return;
        }
      } catch (_) {
        // fall through with raw data
      }
    }

    setEntries(rows);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCurrentUserId(data.user.id);
        supabase
          .from('admin_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle()
          .then(({ data: roleData }) => {
            setCurrentRole((roleData?.role as AdminRole) ?? null);
          });
      }
    });
    fetchEntries();
  }, [fetchEntries]);

  const isSuperAdmin = currentRole === 'Super Admin';

  // ── Role change ────────────────────────────────────────────────────────────
  const handleRoleChange = async (entry: RoleEntry, newRole: AdminRole) => {
    if (!isSuperAdmin || entry.role === newRole) return;
    setSaving(entry.id);
    const { error } = await supabase
      .from('admin_roles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', entry.id);
    if (error) {
      showToast('error', 'Failed to update role.');
    } else {
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, role: newRole } : e)));
      showToast('success', `Role updated to ${newRole}.`);
    }
    setSaving(null);
  };

  // ── Remove ─────────────────────────────────────────────────────────────────
  const handleRemove = async (entry: RoleEntry) => {
    setDeleting(entry.id);
    const { error } = await supabase.from('admin_roles').delete().eq('id', entry.id);
    if (error) {
      showToast('error', 'Failed to remove admin access.');
    } else {
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
      showToast('success', 'Admin access removed.');
    }
    setDeleting(null);
    setConfirmRemove(null);
  };

  // ── Lookup user by email ───────────────────────────────────────────────────
  const handleLookup = async () => {
    setInviteError('');
    setLookupResult(null);
    if (!inviteEmail.trim()) { setInviteError('Please enter an email address.'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) { setInviteError('Please enter a valid email address.'); return; }

    setLookingUp(true);
    const result = await callEdgeFn({ action: 'lookup_by_email', email: inviteEmail.trim() });
    setLookingUp(false);

    if (result.error) {
      setInviteError(result.error);
      return;
    }

    const alreadyExists = entries.some((e) => e.user_id === result.user_id);
    if (alreadyExists) {
      setInviteError('This user already has an admin role assigned.');
      return;
    }

    setLookupResult(result);
  };

  // ── Assign role ────────────────────────────────────────────────────────────
  const handleAssign = async () => {
    if (!lookupResult) return;
    setInviting(true);
    const result = await callEdgeFn({
      action: 'assign_role_by_email',
      email: lookupResult.email,
      role: inviteRole,
    });
    setInviting(false);

    if (result.error) {
      setInviteError(result.error);
      return;
    }

    showToast('success', `${inviteRole} role assigned to ${lookupResult.email}.`);
    setShowInvite(false);
    resetInviteModal();
    fetchEntries();
  };

  const resetInviteModal = () => {
    setInviteEmail('');
    setInviteRole('Editor');
    setInviteError('');
    setLookupResult(null);
    setLookingUp(false);
    setInviting(false);
  };

  const displayName = (entry: RoleEntry) =>
    entry.full_name || entry.email || entry.user_id.slice(0, 8) + '\u2026';

  const roleCounts = ROLES.reduce<Record<string, number>>((acc, r) => {
    acc[r] = entries.filter((e) => e.role === r).length;
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-teal-500 text-white' : 'bg-red-500 text-white'}`}>
          <i className={toast.type === 'success' ? 'ri-check-line text-lg' : 'ri-error-warning-line text-lg'}></i>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">Role Management</h1>
          <p className="text-xs sm:text-sm text-gray-500">Assign and manage admin roles for your team. Only Super Admins can make changes.</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => { resetInviteModal(); setShowInvite(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap cursor-pointer self-start"
          >
            <i className="ri-user-add-line text-sm"></i>
            Add Admin
          </button>
        )}
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {ROLES.map((role) => {
          const meta = ROLE_META[role];
          return (
            <div key={role} className={`rounded-xl border ${meta.border} ${meta.bg} p-3 sm:p-4 flex items-center gap-3`}>
              <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm ${meta.text} flex-shrink-0`}>
                <i className={`${meta.icon} text-base`}></i>
              </div>
              <div>
                <p className={`text-xs sm:text-sm font-bold ${meta.text}`}>{role}</p>
                <p className="text-xs text-gray-500 mt-0.5">{roleCounts[role] ?? 0} member{roleCounts[role] !== 1 ? 's' : ''}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Access Notice for non-Super Admins */}
      {!isSuperAdmin && currentRole && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-xs sm:text-sm text-amber-700">
          <i className="ri-information-line text-base flex-shrink-0 mt-0.5"></i>
          <span>You are viewing this page as <strong>{currentRole}</strong>. Only Super Admins can assign or change roles.</span>
        </div>
      )}

      {/* Role Descriptions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {ROLES.map((role) => {
          const meta = ROLE_META[role];
          return (
            <div key={role} className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <i className={`${meta.icon} ${meta.text} text-sm`}></i>
                <span className={`text-xs sm:text-sm font-bold ${meta.text}`}>{role}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{meta.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
        <button
          onClick={() => setMatrixExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-900 text-white">
              <i className="ri-table-line text-sm"></i>
            </div>
            <div className="text-left">
              <h2 className="text-sm font-bold text-gray-900">Permissions Matrix</h2>
              <p className="text-xs text-gray-400 mt-0.5">Exact access level for each role across all admin pages</p>
            </div>
          </div>
          <i className={`ri-arrow-${matrixExpanded ? 'up' : 'down'}-s-line text-gray-400 text-lg`}></i>
        </button>

        {matrixExpanded && (
          <>
            <div className="flex items-center gap-5 px-6 py-3 bg-gray-50 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">Legend:</span>
              {(Object.entries(PERMISSION_CONFIG) as [PermissionLevel, typeof PERMISSION_CONFIG[PermissionLevel]][]).map(([level, cfg]) => (
                <div key={level} className="flex items-center gap-1.5">
                  <i className={`${cfg.icon} ${cfg.iconColor} text-sm`}></i>
                  <span className="text-xs text-gray-600 font-medium">{cfg.label}</span>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide w-64">Admin Page</th>
                    {ROLES.map((role) => {
                      const meta = ROLE_META[role];
                      return (
                        <th key={role} className="px-4 py-3 text-center w-40">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${meta.bg} ${meta.text} ${meta.border}`}>
                            <i className={`${meta.icon} text-xs`}></i>
                            {role}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSIONS_MATRIX.map((group, gi) => (
                    <>
                      <tr key={`group-${gi}`} className="bg-gray-50/70">
                        <td colSpan={4} className="px-6 py-2.5">
                          <div className="flex items-center gap-2">
                            <i className={`${group.groupIcon} text-gray-400 text-sm`}></i>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{group.group}</span>
                          </div>
                        </td>
                      </tr>
                      {group.rows.map((row, ri) => (
                        <tr key={`${gi}-${ri}`} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 flex-shrink-0">
                                <i className={`${row.icon} text-gray-500 text-xs`}></i>
                              </div>
                              <span className="text-sm text-gray-700 font-medium">{row.page}</span>
                            </div>
                          </td>
                          {ROLES.map((role) => {
                            const level = row.permissions[role];
                            const cfg = PERMISSION_CONFIG[level];
                            return (
                              <td key={role} className={`px-4 py-3 text-center ${cfg.cellBg}`}>
                                <div className="flex flex-col items-center gap-1">
                                  <i className={`${cfg.icon} ${cfg.iconColor} text-base`}></i>
                                  <span className={`text-xs font-semibold ${cfg.badgeText}`}>{cfg.label}</span>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
              <i className="ri-information-line text-sm flex-shrink-0"></i>
              <span>Permissions are enforced at the role level. Super Admins can change any member&apos;s role from the list below.</span>
            </div>
          </>
        )}
      </div>

      {/* Admin Members List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Admin Members</h2>
          <span className="text-xs text-gray-400">{entries.length} total</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
            <i className="ri-loader-4-line animate-spin text-xl"></i>
            <span className="text-sm">Loading members…</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
              <i className="ri-team-line text-3xl"></i>
            </div>
            <p className="text-sm font-medium text-gray-500">No admin members yet</p>
            <p className="text-xs text-gray-400 mt-1">Click &quot;Add Admin&quot; to assign the first role.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {entries.map((entry) => {
              const meta = ROLE_META[entry.role];
              const isCurrentUser = entry.user_id === currentUserId;
              const isSavingThis = saving === entry.id;
              const isDeletingThis = deleting === entry.id;
              const avatarColor = getAvatarColor(entry.user_id);
              const name = displayName(entry);

              return (
                <div key={entry.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <span className="text-white font-bold text-sm leading-none">{name.charAt(0).toUpperCase()}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {entry.full_name || entry.email || 'Unknown User'}
                      </p>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 bg-teal-50 text-teal-600 text-xs font-semibold rounded-full whitespace-nowrap">You</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {entry.email ? entry.email : `ID: ${entry.user_id.slice(0, 16)}…`}
                    </p>
                    <p className="text-xs text-gray-300 truncate">
                      Added {new Date(entry.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  {/* Role Badge / Selector */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {isSuperAdmin && !isCurrentUser ? (
                      <div className="relative">
                        <select
                          value={entry.role}
                          onChange={(e) => handleRoleChange(entry, e.target.value as AdminRole)}
                          disabled={isSavingThis}
                          className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-semibold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all ${meta.bg} ${meta.text} ${meta.border}`}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <i className={`ri-arrow-down-s-line absolute right-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${meta.text}`}></i>
                        {isSavingThis && (
                          <i className="ri-loader-4-line animate-spin absolute -right-5 top-1/2 -translate-y-1/2 text-teal-500 text-sm"></i>
                        )}
                      </div>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${meta.bg} ${meta.text} ${meta.border}`}>
                        <i className={`${meta.icon} text-xs`}></i>
                        {entry.role}
                      </span>
                    )}

                    {isSuperAdmin && !isCurrentUser && (
                      <button
                        onClick={() => setConfirmRemove(entry)}
                        disabled={isDeletingThis}
                        title="Remove admin access"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                      >
                        {isDeletingThis ? (
                          <i className="ri-loader-4-line animate-spin text-sm"></i>
                        ) : (
                          <i className="ri-delete-bin-line text-sm"></i>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add Admin Modal ── */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add Admin Member</h3>
                <p className="text-xs text-gray-400 mt-0.5">Search by email address to find and assign a role</p>
              </div>
              <button
                onClick={() => { setShowInvite(false); resetInviteModal(); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-all cursor-pointer"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            <div className="space-y-5">
              {/* Step 1: Email lookup */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  User Email Address <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => { setInviteEmail(e.target.value); setLookupResult(null); setInviteError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                    placeholder="user@example.com"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                  <button
                    onClick={handleLookup}
                    disabled={lookingUp || !inviteEmail.trim()}
                    className="px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
                  >
                    {lookingUp ? (
                      <i className="ri-loader-4-line animate-spin text-base"></i>
                    ) : (
                      <span className="flex items-center gap-1.5"><i className="ri-search-line text-sm"></i>Find</span>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">The user must already have a registered account.</p>
              </div>

              {/* Step 2: User found card */}
              {lookupResult && (
                <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(lookupResult.user_id)} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-sm leading-none">
                      {(lookupResult.full_name || lookupResult.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {lookupResult.full_name && (
                      <p className="text-sm font-semibold text-gray-900 truncate">{lookupResult.full_name}</p>
                    )}
                    <p className="text-xs text-gray-500 truncate">{lookupResult.email}</p>
                    <p className="text-xs text-gray-400 truncate">ID: {lookupResult.user_id.slice(0, 16)}…</p>
                  </div>
                  <div className="w-6 h-6 flex items-center justify-center rounded-full bg-teal-500 flex-shrink-0">
                    <i className="ri-check-line text-white text-xs"></i>
                  </div>
                </div>
              )}

              {/* Step 3: Role selection */}
              {lookupResult && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Assign Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ROLES.map((role) => {
                      const meta = ROLE_META[role];
                      const selected = inviteRole === role;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setInviteRole(role)}
                          className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 text-xs font-semibold transition-all cursor-pointer ${selected ? `${meta.border} ${meta.bg} ${meta.text}` : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                        >
                          <i className={`${meta.icon} text-base`}></i>
                          {role}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{ROLE_META[inviteRole].desc}</p>
                </div>
              )}

              {/* Error */}
              {inviteError && (
                <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <i className="ri-error-warning-line text-sm flex-shrink-0"></i>
                  {inviteError}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowInvite(false); resetInviteModal(); }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all whitespace-nowrap cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={!lookupResult || inviting}
                  className="flex-1 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-all whitespace-nowrap cursor-pointer disabled:opacity-40"
                >
                  {inviting ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="ri-loader-4-line animate-spin"></i> Assigning…
                    </span>
                  ) : (
                    'Assign Role'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Remove Modal ── */}
      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 text-center">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-100 mx-auto mb-4">
              <i className="ri-user-unfollow-line text-2xl text-red-500"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Remove Admin Access?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will revoke all admin access for{' '}
              <strong className="text-gray-800">{displayName(confirmRemove)}</strong>. They will no longer be able to access the admin panel.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRemove(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all whitespace-nowrap cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemove(confirmRemove)}
                disabled={deleting === confirmRemove.id}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                {deleting === confirmRemove.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-loader-4-line animate-spin"></i> Removing…
                  </span>
                ) : (
                  'Yes, Remove'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
