import React, { useState, useEffect } from 'react';
import { X, Paperclip, Loader2 } from 'lucide-react';

export interface WriteReviewFormData {
  text: string;
  file?: File;
  authorName?: string;
  authorEmail: string;
}

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WriteReviewFormData) => Promise<void>;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setText('');
      setFile(null);
      setAuthorName('');
      setAuthorEmail('');
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
        file: file || undefined,
        authorName: authorName.trim() || undefined,
        authorEmail: email,
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
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Your name (optional)</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full border border-gray-300 p-2.5 text-sm focus:outline-none focus:border-[#e31e24]"
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
              className="w-full border border-gray-300 p-2.5 text-sm focus:outline-none focus:border-[#e31e24]"
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
              className="w-full border border-gray-300 p-2.5 text-sm focus:outline-none focus:border-[#e31e24] resize-y"
              placeholder="Share your experience..."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Attach a file (optional)</label>
            <label className="flex items-center gap-2 border border-gray-300 border-dashed p-3 rounded cursor-pointer hover:bg-gray-50 transition">
              <Paperclip size={16} className="text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-600 truncate">
                {file ? file.name : 'Choose image or document'}
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
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
              className="flex-1 bg-[#e31e24] text-white font-bold uppercase py-2.5 text-sm hover:bg-[#c41a1f] transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
