'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Settings, 
  Bell, 
  Shield, 
  Key, 
  Trash2, 
  Eye, 
  AlertTriangle,
  ChevronRight,
  Lock,
  User,
  MessageSquare,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    toast.success('Notification preferences saved successfully');
  };

  const notificationSettings = [
    { key: 'issueUpdates', label: 'Issue Updates', description: 'Get notified when issues are updated', icon: AlertTriangle },
    { key: 'announcements', label: 'Announcements', description: 'Get notified about new announcements', icon: MessageSquare },
    { key: 'lostFound', label: 'Lost & Found', description: 'Get notified about lost & found items', icon: Package },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-500 to-neutral-600 shadow-lg shadow-neutral-500/20">
              <Settings className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                Settings
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Manage your preferences and account
              </p>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
              <Bell className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Notification Preferences
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Choose how you want to receive updates
              </p>
            </div>
          </div>
          
          <div className="space-y-1">
            {/* Email & Push Toggles */}
            <SettingToggle
              label="Email Notifications"
              description="Receive notifications via email"
              checked={notifications.email}
              onChange={(checked) => handleNotificationChange('email', checked)}
              icon={Mail}
            />
            <SettingToggle
              label="Push Notifications"
              description="Receive push notifications in browser"
              checked={notifications.push}
              onChange={(checked) => handleNotificationChange('push', checked)}
              icon={Bell}
            />
            
            <div className="border-t border-neutral-200 dark:border-neutral-700 my-4 pt-4">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 px-1">
                Notification Types
              </p>
              
              {notificationSettings.map((setting) => (
                <SettingToggle
                  key={setting.key}
                  label={setting.label}
                  description={setting.description}
                  checked={notifications[setting.key as keyof typeof notifications]}
                  onChange={(checked) => handleNotificationChange(setting.key, checked)}
                  icon={setting.icon}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <Button onClick={handleSaveNotifications}>
              Save Preferences
            </Button>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Privacy Settings
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Control your profile visibility
              </p>
            </div>
          </div>
          
          <SettingToggle
            label="Profile Visibility"
            description="Make your profile visible to other users"
            checked={true}
            onChange={() => {}}
            icon={User}
          />
        </div>

        {/* Security */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100 dark:bg-success-900/30">
              <Shield className="h-5 w-5 text-success-600 dark:text-success-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Security
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Keep your account secure
              </p>
            </div>
          </div>
          
          <Link
            href="/settings/change-password"
            className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-100 dark:bg-warning-900/30">
                <Key className="h-5 w-5 text-warning-600 dark:text-warning-400" />
              </div>
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">Change Password</p>
                <p className="text-sm text-neutral-500">Update your account password</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Danger Zone */}
        <div className="card border-l-4 border-l-error-500 dark:border-l-error-400">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error-100 dark:bg-error-900/30">
              <AlertTriangle className="h-5 w-5 text-error-600 dark:text-error-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-error-700 dark:text-error-400">
                Danger Zone
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Irreversible actions for your account
              </p>
            </div>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Once you delete your account, there is no going back. Please be certain. All your data will be permanently removed.
          </p>
          <Button variant="destructive" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function SettingToggle({ 
  label, 
  description, 
  checked, 
  onChange,
  icon: Icon
}: { 
  label: string; 
  description: string; 
  checked: boolean; 
  onChange: (checked: boolean) => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors -mx-2">
      <div className="flex items-center gap-3 flex-1">
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
            <Icon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{label}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
      </label>
    </div>
  );
}

function Mail({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

export default function SettingsPage() {
  return <SettingsContent />;
}
