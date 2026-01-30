'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useCreateLostFound } from '@/hooks/mutations/use-lost-found-mutations';
import { LostFoundCategory, LostFoundStatus } from '@/types/lost-found.types';

function CreateLostFoundContent() {
  const router = useRouter();
  const createItem = useCreateLostFound();

  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    category: 'OTHER' as LostFoundCategory,
    status: 'LOST' as LostFoundStatus,
    location: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [potentialMatches, setPotentialMatches] = useState<any[]>([]);
  const [showMatches, setShowMatches] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + images.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setImages(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await createItem.mutateAsync({
        ...formData,
        images,
      });

      if (result.potentialMatches && result.potentialMatches.length > 0) {
        setPotentialMatches(result.potentialMatches);
        setShowMatches(true);
      } else {
        router.push('/lost-found');
      }
    } catch (error) {
      console.error('Create item error:', error);
    }
  };

  if (showMatches) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              Potential Matches Found!
            </h2>
            <p className="text-neutral-700 mb-6">
              We found some items that might match yours:
            </p>

            <div className="space-y-4 mb-6">
              {potentialMatches.map((match) => (
                <div key={match.id} className="border border-neutral-200 rounded p-4">
                  <div className="flex gap-4">
                    {match.images?.[0] && (
                      <img
                        src={match.images[0]}
                        alt={match.itemName}
                        className="w-24 h-24 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900">{match.itemName}</h3>
                      <p className="text-sm text-neutral-600 mt-1">{match.description}</p>
                      <div className="mt-2 text-xs text-neutral-500">
                        <span>{match.location}</span> • <span>{new Date(match.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <a
                      href={`/lost-found/${match.id}`}
                      target="_blank"
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 self-start"
                    >
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push('/lost-found')}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Continue to Lost & Found
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-neutral-900">Report Lost/Found Item</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Item Status *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="LOST"
                  checked={formData.status === 'LOST'}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600"
                />
                <span>I Lost This Item</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="FOUND"
                  checked={formData.status === 'FOUND'}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600"
                />
                <span>I Found This Item</span>
              </label>
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label htmlFor="itemName" className="block text-sm font-medium text-neutral-700 mb-1">
              Item Name *
            </label>
            <input
              id="itemName"
              name="itemName"
              type="text"
              required
              value={formData.itemName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md"
              placeholder="e.g., Black Laptop Bag"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md"
              placeholder="Detailed description..."
            />
          </div>

          {/* Category and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
              >
                <option value="ELECTRONICS">Electronics</option>
                <option value="CLOTHING">Clothing</option>
                <option value="BOOKS">Books</option>
                <option value="ACCESSORIES">Accessories</option>
                <option value="DOCUMENTS">Documents</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-1">
                Location *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                placeholder="e.g., Library, 2nd Floor"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-neutral-700 mb-1">
              Date {formData.status === 'LOST' ? 'Lost' : 'Found'} *
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Images (Max 5)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md"
            />
            
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-error-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createItem.isPending}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {createItem.isPending ? 'Submitting...' : 'Report Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateLostFoundPage() {
  return (
    <ProtectedRoute>
      <CreateLostFoundContent />
    </ProtectedRoute>
  );
}