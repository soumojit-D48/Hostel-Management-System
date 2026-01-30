'use client';

import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useIssue } from '@/hooks/queries/use-issues';
import { useAuth } from '@/hooks/use-auth';
import { CommentsSection } from '@/components/issues/comments-section';
import { ReactionsBar } from '@/components/issues/reactions-bar';


function IssueDetailContent() {
    const params = useParams();
    const issueId = params.id as string;
    const { user } = useAuth();

    const { data: issue, isLoading, error } = useIssue(issueId);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error || !issue) {
        return (
            <div className="min-h-screen bg-neutral-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded">
                        Issue not found or error loading issue
                    </div>
                </div>
            </div>
        );
    }

    const isOwner = user?.id === issue.reportedBy.id;
    const isManagement = user?.role === 'MANAGEMENT';

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="bg-white shadow">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-neutral-900">Issue Details</h1>
                        <div className="flex gap-2">
                            <span className={`px-3 py-1 text-sm font-medium rounded ${issue.status === 'RESOLVED' ? 'bg-success-100 text-success-700' :
                                    issue.status === 'IN_PROGRESS' ? 'bg-info-100 text-info-700' :
                                        issue.status === 'ASSIGNED' ? 'bg-warning-100 text-warning-700' :
                                            'bg-neutral-100 text-neutral-700'
                                }`}>
                                {issue.status}
                            </span>
                            <span className={`px-3 py-1 text-sm font-medium rounded ${issue.priority === 'URGENT' ? 'bg-error-100 text-error-700' :
                                    issue.priority === 'HIGH' ? 'bg-warning-100 text-warning-700' :
                                        'bg-neutral-100 text-neutral-700'
                                }`}>
                                {issue.priority}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Issue Header */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                        {issue.title}
                    </h2>

                    <div className="flex items-center gap-4 text-sm text-neutral-600 mb-4">
                        <span className="px-2 py-1 bg-neutral-100 rounded">
                            {issue.category}
                        </span>
                        <span>
                            Reported by: <strong>{issue.reportedBy.name}</strong>
                        </span>
                        <span>
                            {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="prose max-w-none">
                        <p className="text-neutral-700 whitespace-pre-wrap">{issue.description}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-neutral-200">
                        <ReactionsBar issueId={issueId} />
                    </div>


                    {(issue.location || issue.roomNumber) && (
                        <div className="mt-4 flex gap-4 text-sm">
                            {issue.location && (
                                <div>
                                    <span className="text-neutral-600">Location:</span>{' '}
                                    <strong>{issue.location}</strong>
                                </div>
                            )}
                            {issue.roomNumber && (
                                <div>
                                    <span className="text-neutral-600">Room:</span>{' '}
                                    <strong>{issue.roomNumber}</strong>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Images */}
                {issue.images && issue.images.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Images</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {issue.images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`Issue image ${idx + 1}`}
                                    className="w-full h-48 object-cover rounded cursor-pointer hover:opacity-90"
                                    onClick={() => window.open(img, '_blank')}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Assigned To */}
                {issue.assignedTo && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Assigned To</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-primary-700 font-semibold">
                                    {issue.assignedTo.name.charAt(0)}
                                </span>
                            </div>
                            <div>
                                <p className="font-medium text-neutral-900">{issue.assignedTo.name}</p>
                                <p className="text-sm text-neutral-600">{issue.assignedTo.email}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Management Actions */}
                {isManagement && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                            Management Actions
                        </h3>
                        <div className="flex gap-4">
                            <button className="px-4 py-2 bg-info-600 text-white rounded-md hover:bg-info-700">
                                Update Status
                            </button>
                            <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                                Assign Issue
                            </button>
                        </div>
                    </div>
                )}

                {/* Comments Section  */}
                <CommentsSection issueId={issueId} />
            </div>
        </div>
    );
}

export default function IssueDetailPage() {
    return (
        <ProtectedRoute>
            <IssueDetailContent />
        </ProtectedRoute>
    );
}