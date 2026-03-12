
import { useState } from 'react';

const mockUsers = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah.j@email.com', joinDate: '2024-01-15', orderCount: 12 },
  { id: '2', name: 'Michael Chen', email: 'michael.chen@email.com', joinDate: '2024-02-03', orderCount: 8 },
  { id: '3', name: 'Emma Williams', email: 'emma.w@email.com', joinDate: '2024-02-18', orderCount: 15 },
  { id: '4', name: 'James Rodriguez', email: 'james.r@email.com', joinDate: '2024-03-05', orderCount: 5 },
  { id: '5', name: 'Olivia Martinez', email: 'olivia.m@email.com', joinDate: '2024-03-12', orderCount: 22 },
  { id: '6', name: 'David Kim', email: 'david.kim@email.com', joinDate: '2024-03-20', orderCount: 9 },
  { id: '7', name: 'Sophia Anderson', email: 'sophia.a@email.com', joinDate: '2024-04-02', orderCount: 18 },
  { id: '8', name: 'Daniel Brown', email: 'daniel.b@email.com', joinDate: '2024-04-15', orderCount: 6 }
];

export default function UserProfilePage() {
  const [profileData, setProfileData] = useState({
    name: 'Admin User',
    email: 'admin@audiostore.com',
    avatar:
      'https://readdy.ai/api/search-image?query=professional%20business%20person%20portrait%20with%20confident%20smile%20modern%20office%20background%20clean%20professional%20headshot%20photo%20realistic&width=200&height=200&seq=admin-avatar-001&orientation=squarish',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [saved, setSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSaveProfile = () => {
    // Basic validation for password match
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordError('');
    setSaved(true);
    // Reset saved indicator after a short period
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Profile &amp; Management</h1>
        <p className="text-sm text-gray-600">Manage your profile and view customer accounts</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Admin Profile Section */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Admin Profile</h2>

            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 mb-4">
                  <img
                    src={profileData.avatar}
                    alt="Admin avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <input
                  type="text"
                  value={profileData.avatar}
                  onChange={(e) =>
                    setProfileData({ ...profileData, avatar: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Avatar URL"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              {/* Password Section */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-4">
                  Change Password
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={profileData.currentPassword}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          currentPassword: e.target.value
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={profileData.newPassword}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          newPassword: e.target.value
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={profileData.confirmPassword}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          confirmPassword: e.target.value
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  {passwordError && (
                    <p className="text-xs text-red-600">{passwordError}</p>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <button
                  onClick={handleSaveProfile}
                  className="w-full px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
                >
                  Save Profile
                </button>
                {saved && (
                  <div className="flex items-center justify-center gap-2 text-green-600 text-sm mt-3">
                    <i className="ri-check-line text-lg"></i>
                    <span>Profile updated</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Accounts Section */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                Customer Accounts
              </h2>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full whitespace-nowrap">
                {mockUsers.length} Users
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-bold text-gray-700 pb-3 pr-4">
                      Name
                    </th>
                    <th className="text-left text-xs font-bold text-gray-700 pb-3 pr-4">
                      Email
                    </th>
                    <th className="text-left text-xs font-bold text-gray-700 pb-3 pr-4">
                      Join Date
                    </th>
                    <th className="text-left text-xs font-bold text-gray-700 pb-3">
                      Orders
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 pr-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {user.name}
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="text-sm text-gray-600">{user.joinDate}</div>
                      </td>
                      <td className="py-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-900 text-xs font-semibold rounded-full whitespace-nowrap">
                          {user.orderCount} orders
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
