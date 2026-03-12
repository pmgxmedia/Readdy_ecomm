import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useSessionTimeout } from '../../hooks/useSessionTimeout';
import type { User } from '@supabase/supabase-js';

type AdminRole = 'Super Admin' | 'Editor' | 'Viewer';

const ROLE_STYLES: Record<AdminRole, { bg: string; text: string; dot: string }> = {
  'Super Admin': { bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500' },
  'Editor':      { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  'Viewer':      { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
};

const ROLE_ICONS: Record<AdminRole, string> = {
  'Super Admin': 'ri-shield-star-line',
  'Editor':      'ri-edit-2-line',
  'Viewer':      'ri-eye-line',
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAdminUser(data.user);
      if (data.user) fetchRole(data.user.id);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAdminUser(session?.user ?? null);
      if (session?.user) fetchRole(session.user.id);
      else setAdminRole(null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId: string) => {
    const { data } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    setAdminRole((data?.role as AdminRole) ?? 'Editor');
  };

  const adminName = adminUser?.user_metadata?.full_name
    || adminUser?.email?.split('@')[0]
    || 'Admin';
  const adminEmail = adminUser?.email ?? '';
  const avatarLetter = adminName.charAt(0).toUpperCase();

  const menuItems = [
    { icon: 'ri-dashboard-line', label: 'Dashboard', path: '/admin' },
    {
      icon: 'ri-settings-3-line',
      label: 'Settings',
      submenu: [
        { label: 'Store Settings', path: '/admin/settings/store' },
        { label: 'Navbar Settings', path: '/admin/settings/navbar' },
        { label: 'Currency Settings', path: '/admin/settings/currency' },
        { label: 'User Profile', path: '/admin/settings/user-profile' },
        { label: 'Role Management', path: '/admin/settings/roles' },
      ],
    },
    {
      icon: 'ri-shopping-bag-line',
      label: 'Orders',
      submenu: [
        { label: 'All Orders', path: '/admin/orders' },
        { label: 'Payments', path: '/admin/orders/payments' },
      ],
    },
    {
      icon: 'ri-file-text-line',
      label: 'Content',
      submenu: [
        { label: 'Hero Section', path: '/admin/content/hero' },
        { label: 'Announcement Bar', path: '/admin/content/announcement-bar' },
        { label: 'Categories', path: '/admin/content/categories' },
        { label: 'New Arrivals', path: '/admin/content/new-arrivals' },
        { label: 'Promotional Products', path: '/admin/content/promotional' },
        { label: 'Popular Products', path: '/admin/content/popular' },
        { label: 'Recommended Products', path: '/admin/content/recommended' },
        { label: 'Featured Product', path: '/admin/content/featured' },
        { label: 'Footer Content', path: '/admin/content/footer' },
        { label: 'Price History', path: '/admin/content/price-history' },
      ],
    },
    { icon: 'ri-shopping-cart-line', label: 'Checkout', path: '/admin/checkout' },
  ];

  const getActiveGroup = () => {
    for (const item of menuItems) {
      if (item.submenu) {
        if (item.submenu.some((s) => location.pathname.startsWith(s.path))) return item.label;
      }
    }
    return null;
  };

  const [openGroup, setOpenGroup] = useState<string | null>(getActiveGroup);

  const toggleGroup = (label: string) => {
    setOpenGroup((prev) => (prev === label ? null : label));
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setLoggingOut(false);
    navigate('/');
  };

  const handleSessionTimeout = async () => {
    await supabase.auth.signOut();
    navigate('/', { state: { sessionExpired: true } });
  };

  const { warningVisible, secondsLeft, stayActive } = useSessionTimeout({
    onTimeout: handleSessionTimeout,
    enabled: true,
  });

  const roleStyle = adminRole ? ROLE_STYLES[adminRole] : ROLE_STYLES['Editor'];
  const roleIcon  = adminRole ? ROLE_ICONS[adminRole]  : ROLE_ICONS['Editor'];

  // Get current page title for mobile header
  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    if (currentItem) return currentItem.label;
    
    for (const item of menuItems) {
      if (item.submenu) {
        const subItem = item.submenu.find(s => s.path === location.pathname);
        if (subItem) return subItem.label;
      }
    }
    return 'Admin Panel';
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Session Timeout Warning Modal */}
      {warningVisible && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-amber-100 mx-auto mb-4">
              <i className="ri-time-line text-3xl text-amber-500"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Session Expiring Soon</h2>
            <p className="text-gray-500 text-sm mb-6">
              You've been inactive for a while. You'll be automatically signed out in:
            </p>
            <div className="text-5xl font-bold text-amber-500 mb-6 tabular-nums">
              {secondsLeft}s
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSessionTimeout}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all whitespace-nowrap cursor-pointer"
              >
                Sign Out Now
              </button>
              <button
                onClick={stayActive}
                className="flex-1 px-4 py-2.5 rounded-lg bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 transition-all whitespace-nowrap cursor-pointer"
              >
                Stay Signed In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center px-4">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
          aria-label="Open menu"
        >
          <i className="ri-menu-line text-xl"></i>
        </button>
        <div className="flex-1 ml-3">
          <h1 className="text-base font-bold text-gray-900 truncate">{getCurrentPageTitle()}</h1>
          <p className="text-xs text-gray-400">Audio Store Admin</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-white font-bold text-xs leading-none">{avatarLetter}</span>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar - Mobile Drawer / Desktop Fixed */}
      <aside className={`
        w-64 bg-white border-r border-gray-200 h-full overflow-y-auto flex flex-col
        fixed top-0 bottom-0 z-50 transition-transform duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Mobile Close Button */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-sm font-bold text-gray-900">Menu</h2>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
            aria-label="Close menu"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Sidebar Header — Admin Profile */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white font-bold text-base leading-none">{avatarLetter}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{adminName}</p>
              <p className="text-xs text-gray-400 truncate">{adminEmail}</p>
            </div>
            <Link
              to="/admin/settings/user-profile"
              title="Edit profile"
              className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-all cursor-pointer flex-shrink-0"
            >
              <i className="ri-pencil-line text-sm"></i>
            </Link>
          </div>

          {/* Role Badge */}
          <div className="mt-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0"></span>
            <span className="text-xs text-gray-500">Admin Panel</span>
            {adminRole && (
              <span
                className={`ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${roleStyle.bg} ${roleStyle.text}`}
              >
                <i className={`${roleIcon} text-xs`}></i>
                {adminRole}
              </span>
            )}
          </div>
        </div>

        <nav className="p-4 flex-1">
          {menuItems.map((item) => {
            if (item.path) {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all whitespace-nowrap cursor-pointer ${
                    isActive ? 'bg-teal-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <i className={`${item.icon} text-lg w-5 h-5 flex items-center justify-center`}></i>
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            }

            const isGroupOpen = openGroup === item.label;
            const isGroupActive = item.submenu!.some((s) => location.pathname.startsWith(s.path));

            return (
              <div key={item.label} className="mb-1">
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    isGroupActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <i className={`${item.icon} text-lg w-5 h-5 flex items-center justify-center`}></i>
                  <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
                  <i className={`ri-arrow-${isGroupOpen ? 'up' : 'down'}-s-line text-gray-400`}></i>
                </button>

                {isGroupOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.submenu!.map((sub) => {
                      const isSubActive = location.pathname === sub.path;
                      return (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap cursor-pointer text-sm ${
                            isSubActive
                              ? 'bg-teal-500 text-white font-semibold'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 flex-shrink-0"></span>
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all whitespace-nowrap cursor-pointer"
          >
            <i className="ri-arrow-left-line text-lg w-5 h-5 flex items-center justify-center"></i>
            <span className="font-medium text-sm">Back to Store</span>
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            {loggingOut ? (
              <i className="ri-loader-4-line animate-spin text-lg w-5 h-5 flex items-center justify-center"></i>
            ) : (
              <i className="ri-logout-box-r-line text-lg w-5 h-5 flex items-center justify-center"></i>
            )}
            <span className="font-medium text-sm">{loggingOut ? 'Signing out…' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen pt-16 md:pt-0 md:ml-64 pb-safe">
        <Outlet />
      </main>
    </div>
  );
}