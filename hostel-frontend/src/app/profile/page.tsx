'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/hooks/use-auth';

function ProfileContent() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    emergencyContact: user?.emergencyContact || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // TODO: Call update profile API
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-neutral-900">Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 text-3xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">{user.name}</h2>
              <p className="text-sm text-neutral-600 mt-1">
                {user.role === 'STUDENT' ? 'Student' : 'Management'}
              </p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email (non-editable) */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-neutral-50 text-neutral-500"
              />
            </div>

            {/* Roll Number (non-editable for students) */}
            {user.rollNumber && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  value={user.rollNumber}
                  disabled
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-neutral-50 text-neutral-500"
                />
              </div>
            )}

            {/* Name (editable) */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md disabled:bg-neutral-50 disabled:text-neutral-500"
              />
            </div>

            {/* Phone (editable) */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md disabled:bg-neutral-50 disabled:text-neutral-500"
              />
            </div>

            {/* Emergency Contact (editable) */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Emergency Contact
              </label>
              <input
                type="tel"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md disabled:bg-neutral-50 disabled:text-neutral-500"
              />
            </div>

            {/* Hostel (non-editable) */}
            {user.hostel && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Hostel
                </label>
                <input
                  type="text"
                  value={user.hostel.name}
                  disabled
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-neutral-50 text-neutral-500"
                />
              </div>
            )}

            {/* Block (non-editable) */}
            {user.block && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Block
                </label>
                <input
                  type="text"
                  value={user.block.name}
                  disabled
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-neutral-50 text-neutral-500"
                />
              </div>
            )}

            {/* Room Number (non-editable) */}
            {user.roomNumber && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Room Number
                </label>
                <input
                  type="text"
                  value={user.roomNumber}
                  disabled
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-neutral-50 text-neutral-500"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-neutral-200">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user.name || '',
                      phone: user.phone || '',
                      emergencyContact: user.emergencyContact || '',
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Account Info */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Account Information
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">Account Status:</span>
              <span className={`font-medium ${user.isVerified ? 'text-success-700' : 'text-warning-700'}`}>
                {user.isVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Last Login:</span>
              <span className="text-neutral-900">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Account Created:</span>
              <span className="text-neutral-900">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}