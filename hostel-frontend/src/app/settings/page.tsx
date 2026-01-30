'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/hooks/use-auth';

function SettingsContent() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    issueUpdates: true,
    announcements: true,
    lostFound: true,
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveNotifications = () => {
    console.log('Saving notifications:', notifications);
    // TODO: Call update settings API
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Notification Preferences
          </h2>
          
          <div className="space-y-4">
            <SettingToggle
              label="Email Notifications"
              description="Receive notifications via email"
              checked={notifications.email}
              onChange={(checked) => handleNotificationChange('email', checked)}
            />
            
            <SettingToggle
              label="Push Notifications"
              description="Receive push notifications in browser"
              checked={notifications.push}
              onChange={(checked) => handleNotificationChange('push', checked)}
            />
            
            <div className="border-t border-neutral-200 pt-4">
              <p className="text-sm font-medium text-neutral-700 mb-3">
                Notification Types
              </p>
              
              <SettingToggle
                label="Issue Updates"
                description="Get notified when issues are updated"
                checked={notifications.issueUpdates}
                onChange={(checked) => handleNotificationChange('issueUpdates', checked)}
              />
              
              <SettingToggle
                label="Announcements"
                description="Get notified about new announcements"
                checked={notifications.announcements}
                onChange={(checked) => handleNotificationChange('announcements', checked)}
              />
              
              <SettingToggle
                label="Lost & Found"
                description="Get notified about lost & found items"
                checked={notifications.lostFound}
                onChange={(checked) => handleNotificationChange('lostFound', checked)}
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-200">
            <button
              onClick={handleSaveNotifications}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Save Preferences
            </button>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Privacy Settings
          </h2>
          
          <SettingToggle
            label="Profile Visibility"
            description="Make your profile visible to other users"
            checked={true}
            onChange={() => {}}
          />
        </div>

        {/* Security */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Security
          </h2>
          
          <Link
            href="/settings/change-password"
            className="block px-4 py-3 border border-neutral-300 rounded-md hover:bg-neutral-50 text-center font-medium text-neutral-900"
          >
            Change Password
          </Link>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-error-500">
          <h2 className="text-lg font-semibold text-error-700 mb-4">
            Danger Zone
          </h2>
          <p className="text-sm text-neutral-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button className="px-4 py-2 bg-error-600 text-white rounded-md hover:bg-error-700">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingToggle({ 
  label, 
  description, 
  checked, 
  onChange 
}: { 
  label: string; 
  description: string; 
  checked: boolean; 
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-neutral-900">{label}</p>
        <p className="text-xs text-neutral-600">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
      </label>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}