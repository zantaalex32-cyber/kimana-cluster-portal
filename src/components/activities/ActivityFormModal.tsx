import React, { useState } from 'react';
import { Activity, ContentVisibility, Locality } from '../../types';
import { useAuth } from '../../lib/auth-context';
import { canPublishActivity } from '../../lib/permissions';
import { X, Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';

interface ActivityFormModalProps {
  activity?: Activity | null;
  localities: Locality[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Activity>) => Promise<void>;
}

export const ActivityFormModal: React.FC<ActivityFormModalProps> = ({
  activity,
  localities,
  isOpen,
  onClose,
  onSave,
}) => {
  const { role } = useAuth();
  const isAdmin = canPublishActivity(role);

  // Form states
  const [title, setTitle] = useState(activity?.title || '');
  const [description, setDescription] = useState(activity?.description || '');
  const [activityType, setActivityType] = useState(activity?.activity_type || 'Devotional Meeting');
  const [localityId, setLocalityId] = useState(activity?.locality_id || (localities[0]?.id || ''));
  
  // Dates
  const defaultStartDate = activity?.start_time
    ? new Date(activity.start_time).toISOString().split('T')[0]
    : '2026-10-15';
  const defaultStartTime = activity?.start_time
    ? new Date(activity.start_time).toTimeString().substring(0, 5)
    : '14:00';
  const defaultEndTime = activity?.end_time
    ? new Date(activity.end_time).toTimeString().substring(0, 5)
    : '16:00';

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [location, setLocation] = useState(activity?.location || '');
  const [visibility, setVisibility] = useState<ContentVisibility>(activity?.visibility || 'members');
  const [submitIntent, setSubmitIntent] = useState<'draft' | 'pending_review' | 'published'>(
    isAdmin ? (activity?.status === 'published' ? 'published' : 'published') : 'pending_review'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a valid activity title.');
      return;
    }

    try {
      setIsSubmitting(true);
      const startDateTime = new Date(`${startDate}T${startTime}:00Z`).toISOString();
      const endDateTime = endTime ? new Date(`${startDate}T${endTime}:00Z`).toISOString() : undefined;

      await onSave({
        title: title.trim(),
        description: description.trim(),
        activity_type: activityType,
        locality_id: localityId,
        start_time: startDateTime,
        end_time: endDateTime,
        location: location.trim(),
        visibility,
        status: submitIntent as any,
      });

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save activity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activityTypes = [
    'Devotional Meeting',
    'Study Circle',
    "Children's Class",
    'Junior Youth Group',
    'Consultation',
    'Coordinators Meeting',
    'Community Service',
    'Administration',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl my-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {activity ? 'Edit Activity' : 'Create Cluster Activity'}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Activity Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Namelok Devotional Gathering"
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Activity Type *</label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              >
                {activityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Locality *</label>
              <select
                value={localityId}
                onChange={(e) => setLocalityId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              >
                {localities.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Start Time *</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Location / Venue</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kimana Central Community Hall, Room 2"
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide agenda, materials to bring, or purpose of gathering..."
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Visibility Level</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as ContentVisibility)}
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              >
                <option value="public">Public (Visible to everyone)</option>
                <option value="members">Members (Verified members only)</option>
                <option value="coordinators">Coordinators (Animators & Tutors)</option>
                {isAdmin && <option value="admins">Admins Only (Restricted)</option>}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Workflow Status</label>
              <select
                value={submitIntent}
                onChange={(e) => setSubmitIntent(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              >
                <option value="draft">Save as Draft</option>
                <option value="pending_review">Submit for Review</option>
                {isAdmin && <option value="published">Publish Immediately</option>}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : activity ? 'Update Activity' : 'Save Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
