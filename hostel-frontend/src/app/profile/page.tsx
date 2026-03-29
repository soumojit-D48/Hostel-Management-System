'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useProfile, useUpdateProfile } from '@/hooks/queries/use-profile';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Phone, 
  AlertCircle, 
  Home, 
  Building, 
  DoorOpen, 
  Calendar, 
  Shield,
  Edit3,
  Save,
  X,
  UserCog
} from 'lucide-react';
import { cn } from '@/lib/utils';

function ProfilePageContent() {
  const { user, updateUser } = useAuth();
  const { data: profileData, isLoading: isLoadingProfile } = useProfile();
  const updateProfile = useUpdateProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    emergencyContact: user?.emergencyContact || '',
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        phone: profileData.phone || '',
        emergencyContact: profileData.emergencyContact || '',
      });
    }
  }, [profileData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(formData);
      if (updateUser) {
        updateUser({ ...user!, ...formData });
      }
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: profileData?.name || user?.name || '',
      phone: profileData?.phone || user?.phone || '',
      emergencyContact: profileData?.emergencyContact || user?.emergencyContact || '',
    });
  };

  if (isLoadingProfile) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </AppShell>
    );
  }

  const currentUser = profileData || user;

  if (!currentUser) return null;

  const getRoleBadge = () => {
    const roleColors = {
      STUDENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      STAFF: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      MANAGEMENT: 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300',
    };
    const roleLabels = {
      STUDENT: 'Student',
      STAFF: 'Staff',
      MANAGEMENT: 'Management',
    };
    return (
      <span className={cn("px-3 py-1 rounded-full text-xs font-medium", roleColors[currentUser.role])}>
        {roleLabels[currentUser.role]}
      </span>
    );
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/20">
              <User className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                My Profile
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Manage your personal information
              </p>
            </div>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="gap-2">
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Profile Card */}
        <div className="card">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col sm:flex-row items-start gap-6 pb-6 border-b border-neutral-200 dark:border-neutral-700">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <span className="text-white text-4xl font-bold">
                {currentUser.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                  {currentUser.name}
                </h2>
                {getRoleBadge()}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {currentUser.email}
                </div>
                {currentUser.rollNumber && (
                  <div className="flex items-center gap-1">
                    <UserCog className="h-4 w-4" />
                    {currentUser.rollNumber}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            {/* Email (Read Only) */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <Mail className="h-4 w-4 text-neutral-500" />
                Email Address
              </label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="w-full px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
              />
            </div>

            {/* Roll Number (Read Only - if exists) */}
            {currentUser.rollNumber && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <UserCog className="h-4 w-4 text-neutral-500" />
                  Roll Number
                </label>
                <input
                  type="text"
                  value={currentUser.rollNumber}
                  disabled
                  className="w-full px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                />
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <User className="h-4 w-4 text-neutral-500" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className={cn(
                  "w-full px-4 py-2.5 border rounded-lg transition-colors",
                  isEditing 
                    ? "border-primary-300 dark:border-primary-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" 
                    : "border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800",
                  "disabled:text-neutral-500 dark:disabled:text-neutral-400"
                )}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <Phone className="h-4 w-4 text-neutral-500" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Enter phone number"
                className={cn(
                  "w-full px-4 py-2.5 border rounded-lg transition-colors",
                  isEditing 
                    ? "border-primary-300 dark:border-primary-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" 
                    : "border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800",
                  "disabled:text-neutral-500 dark:disabled:text-neutral-400"
                )}
              />
            </div>

            {/* Emergency Contact */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <AlertCircle className="h-4 w-4 text-neutral-500" />
                Emergency Contact
              </label>
              <input
                type="tel"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Emergency contact number"
                className={cn(
                  "w-full px-4 py-2.5 border rounded-lg transition-colors",
                  isEditing 
                    ? "border-primary-300 dark:border-primary-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" 
                    : "border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800",
                  "disabled:text-neutral-500 dark:disabled:text-neutral-400"
                )}
              />
            </div>

            {/* Hostel (Read Only) */}
            {currentUser.hostel && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <Home className="h-4 w-4 text-neutral-500" />
                  Hostel
                </label>
                <input
                  type="text"
                  value={currentUser.hostel.name}
                  disabled
                  className="w-full px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                />
              </div>
            )}

            {/* Block (Read Only) */}
            {currentUser.block && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <Building className="h-4 w-4 text-neutral-500" />
                  Block
                </label>
                <input
                  type="text"
                  value={currentUser.block.name}
                  disabled
                  className="w-full px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                />
              </div>
            )}

            {/* Room Number (Read Only) */}
            {currentUser.roomNumber && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <DoorOpen className="h-4 w-4 text-neutral-500" />
                  Room Number
                </label>
                <input
                  type="text"
                  value={currentUser.roomNumber}
                  disabled
                  className="w-full px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-6 mt-6 border-t border-neutral-200 dark:border-neutral-700">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updateProfile.isPending}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="gap-2"
              >
                {updateProfile.isPending ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Account Info Card */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <Shield className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Account Information
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Account Status</span>
              <span className="px-2 py-1 text-xs font-medium bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300 rounded-full">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <span className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Member Since
              </span>
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function ProfilePage() {
  return <ProfilePageContent />;
}
