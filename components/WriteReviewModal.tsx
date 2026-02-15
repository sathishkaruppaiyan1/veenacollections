import React, { useState, useEffect } from 'react';
import { X, Paperclip, Loader2, Star } from 'lucide-react';

export interface WriteReviewFormData {
  text: string;
  image?: string;
  authorName?: string;
  authorEmail: string;
  rating?: number;
}

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WriteReviewFormData) => Promise<void>;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [text, setText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setText('');
      setImagePreview(null);
      setAuthorName('');
      setAuthorEmail('');
      setRating(5);
      setHoverRating(0);
      setFormError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const email = authorEmail.trim();
    const reviewText = text.trim();
    if (!email) {
      setFormError('Please enter your email.');
      return;
    }
    if (!reviewText) {
      setFormError('Please write your review.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        text: reviewText,
        image: imagePreview || undefined,
        authorName: authorName.trim() || undefined,
        authorEmail: email,
        rating,
      });
      onClose();
    } catch (err) {
      setFormError((err as Error).message || 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-2 flex items-center justify-between border-b border-gray-100">
          <h3 className="text-lg font-bold uppercase tracking-wider text-gray-800">Write a Review</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Your Rating <span className="text-red-500">*</span></label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={28}
                    fill={(hoverRating || rating) >= star ? "#EE6348" : "none"}
                    stroke={(hoverRating || rating) >= star ? "#EE6348" : "#d1d5db"}
                    className="transition-colors"
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Your name (optional)</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full border border-gray-300 p-2.5 text-sm focus:outline-none focus:border-[#EE6348]"
              placeholder="e.g. Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              required
              className="w-full border border-gray-300 p-2.5 text-sm focus:outline-none focus:border-[#EE6348]"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Your review <span className="text-red-500">*</span></label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              rows={4}
              className="w-full border border-gray-300 p-2.5 text-sm focus:outline-none focus:border-[#EE6348] resize-y"
              placeholder="Share your experience..."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Attach a photo (optional)</label>
            <label className="flex items-center gap-2 border border-gray-300 border-dashed p-3 rounded cursor-pointer hover:bg-gray-50 transition">
              <Paperclip size={16} className="text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-600 truncate">
                {imagePreview ? 'Image selected' : 'Choose image'}
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => setImagePreview(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                  e.target.value = '';
                }}
              />
            </label>
            {imagePreview && (
              <div className="relative inline-block mt-2">
                <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded border border-gray-200" />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-0.5 text-gray-500 hover:text-red-500 transition"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {formError && (
            <p className="text-sm text-red-600 font-medium">{formError}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 font-bold uppercase py-2.5 text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#EE6348] text-white font-bold uppercase py-2.5 text-sm hover:bg-[#EE6348] transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
