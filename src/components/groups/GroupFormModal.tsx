import React, { useState } from 'react';
import { ContentVisibility, Group, GroupType, Locality } from '../../types';
import { X, AlertCircle } from 'lucide-react';

interface GroupFormModalProps {
  group?: Group | null;
  localities: Locality[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Group>) => Promise<void>;
}

export const GroupFormModal: React.FC<GroupFormModalProps> = ({
  group,
  localities,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(group?.name || '');
  const [groupType, setGroupType] = useState<GroupType>(group?.group_type || 'Study Circle');
  const [localityId, setLocalityId] = useState(group?.locality_id || (localities[0]?.id || ''));
  const [meetingDay, setMeetingDay] = useState(group?.meeting_day || 'Sunday');
  const [meetingTime, setMeetingTime] = useState(group?.meeting_time || '14:00 - 16:00');
  const [location, setLocation] = useState(group?.location || '');
  const [description, setDescription] = useState(group?.description || '');
  const [visibility, setVisibility] = useState<ContentVisibility>(group?.visibility || 'members');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a group name.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        name: name.trim(),
        group_type: groupType,
        locality_id: localityId,
        meeting_day: meetingDay,
        meeting_time: meetingTime,
        location: location.trim(),
        description: description.trim(),
        visibility,
        status: group?.status || 'active',
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save group.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupTypes: GroupType[] = [
    'Study Circle',
    'Devotional Meeting',
    "Children's Class",
    'Junior Youth Group',
    'Other',
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl my-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {group ? 'Edit Community Group' : 'Register Community Group'}
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
            <label className="block font-medium text-slate-700 mb-1">Group Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Isinet Junior Youth - Pioneers"
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Group Classification *</label>
              <select
                value={groupType}
                onChange={(e) => setGroupType(e.target.value as GroupType)}
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              >
                {groupTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Meeting Day</label>
              <select
                value={meetingDay}
                onChange={(e) => setMeetingDay(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              >
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Meeting Time</label>
              <input
                type="text"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                placeholder="e.g. 10:00 - 12:00"
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Gathering Venue / Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Isinet Locality Center"
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Short Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe curriculum stage, age group, or community service emphasis..."
              className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 border border-slate-100">
            <strong>Privacy Guarantee:</strong> Participant contact lists and phone numbers are strictly protected and never displayed in public or routine member views.
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
              {isSubmitting ? 'Saving...' : group ? 'Update Group' : 'Register Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
