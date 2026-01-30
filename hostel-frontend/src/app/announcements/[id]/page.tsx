
'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAnnouncement } from '@/hooks/queries/use-announcements';
import { useMarkAnnouncementRead } from '@/hooks/mutations/use-announcement-mutations';

function AnnouncementDetailContent() {
  const params = useParams();
  const announcementId = params.id as string;

  const { data: announcement, isLoading, error } = useAnnouncement(announcementId);
  const markAsRead = useMarkAnnouncementRead(announcementId);

  useEffect(() => {
    if (announcement && !announcement.isRead) {
      markAsRead.mutate();
    }
  }, [announcement]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded">
            Announcement not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm font-medium rounded ${
              announcement.category === 'EMERGENCY' 
                ? 'bg-error-100 text-error-700' 
                : announcement.category === 'MAINTENANCE'
                ? 'bg-warning-100 text-warning-700'
                : 'bg-info-100 text-info-700'
            }`}>
              {announcement.category}
            </span>
            {announcement.priority === 'HIGH' && (
              <span className="px-3 py-1 text-sm font-medium rounded bg-error-100 text-error-700">
                High Priority
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">
              {announcement.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-neutral-600">
              <span>By {announcement.createdBy.name}</span>
              <span>•</span>
              <span>{new Date(announcement.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Content */}
          <div className="prose max-w-none">
            <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
              {announcement.content}
            </p>
          </div>

          {/* Images */}
          {announcement.images && announcement.images.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {announcement.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Image ${idx + 1}`}
                    className="w-full h-48 object-cover rounded cursor-pointer hover:opacity-90"
                    onClick={() => window.open(img, '_blank')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {announcement.attachments && announcement.attachments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Attachments</h3>
              <div className="space-y-2">
                {announcement.attachments.map((file, idx) => (
                  <a
                    key={idx}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border border-neutral-200 rounded hover:bg-neutral-50"
                  >
                    <span className="text-2xl">📎</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">{file.name}</p>
                      <p className="text-xs text-neutral-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <span className="text-primary-600 text-sm">Download</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Target Info */}
          {(announcement.hostel || announcement.blocks || announcement.targetRoles) && (
            <div className="pt-6 border-t border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-700 mb-2">
                Target Audience
              </h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {announcement.hostel && (
                  <span className="px-2 py-1 bg-neutral-100 rounded">
                    Hostel: {announcement.hostel.name}
                  </span>
                )}
                {announcement.blocks && announcement.blocks.length > 0 && (
                  <span className="px-2 py-1 bg-neutral-100 rounded">
                    Blocks: {announcement.blocks.map(b => b.name).join(', ')}
                  </span>
                )}
                {announcement.targetRoles && announcement.targetRoles.length > 0 && (
                  <span className="px-2 py-1 bg-neutral-100 rounded">
                    Roles: {announcement.targetRoles.join(', ')}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AnnouncementDetailPage() {
  return (
    <ProtectedRoute>
      <AnnouncementDetailContent />
    </ProtectedRoute>
  );
}