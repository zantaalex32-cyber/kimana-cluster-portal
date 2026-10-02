import React, { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { Activity, Locality } from '../types';
import { PRIMARY_CLUSTER_ID, getActivities, getLocalities } from '../lib/db';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  ArrowLeft,
  List,
  Grid,
} from 'lucide-react';
import { VisibilityBadge } from '../components/ui/VisibilityBadge';
import { StatusBadge } from '../components/ui/StatusBadge';

interface CalendarPageProps {
  onNavigate: (path: string) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ onNavigate }) => {
  const { profile, role, cluster } = useAuth();
  const localities = getLocalities(cluster?.id || PRIMARY_CLUSTER_ID, profile || undefined, role);

  const [currentDate, setCurrentDate] = useState(new Date('2026-10-01'));
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Permission-aware retrieval
  const activities = getActivities(profile, role, {
    localityId: selectedLocality,
    activityType: selectedType,
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const prevWeek = new Date(currentDate);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setCurrentDate(prevWeek);
    } else {
      setCurrentDate(new Date(year, month - 1, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setCurrentDate(nextWeek);
    } else {
      setCurrentDate(new Date(year, month + 1, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date('2026-10-15'));
  };

  // Month grid calculations
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Get activities for specific day number (1 - 31)
  const getActivitiesForDay = (day: number) => {
    return activities.filter((act) => {
      const d = new Date(act.start_time);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('/activities')}
            className="inline-flex items-center gap-1.5 text-xs text-emerald-800 hover:text-emerald-950 mb-2 font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Activities</span>
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight text-emerald-950 sm:text-3xl">
            Cluster Calendar
          </h1>
          <p className="text-xs text-slate-600">
            Approved schedule for devotionals, classes, and study circles in {cluster?.name || 'Kimana'}.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-emerald-900/5 rounded-xl shrink-0 border border-emerald-900/10">
          <button
            onClick={() => setViewMode('month')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              viewMode === 'month' ? 'bg-emerald-800 text-white shadow-xs' : 'text-emerald-900 hover:text-emerald-950'
            }`}
          >
            <Grid className="h-3.5 w-3.5" />
            <span>Month</span>
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              viewMode === 'week' ? 'bg-emerald-800 text-white shadow-xs' : 'text-emerald-900 hover:text-emerald-950'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Week</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-emerald-800 text-white shadow-xs' : 'text-emerald-900 hover:text-emerald-950'
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* Date Navigation & Filters Bar */}
      <div className="rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-emerald-900/10 bg-emerald-50/50 p-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-emerald-900 hover:bg-white hover:shadow-2xs transition"
              title="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-emerald-950 hover:bg-white hover:shadow-2xs rounded-lg transition"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg text-emerald-900 hover:bg-white hover:shadow-2xs transition"
              title="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <span className="text-base font-bold text-emerald-950 ml-2">{monthName}</span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedLocality}
            onChange={(e) => setSelectedLocality(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-emerald-700"
          >
            <option value="all">All Localities</option>
            {localities.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-emerald-700"
          >
            <option value="all">All Activity Types</option>
            <option value="Devotional Meeting">Devotional Meeting</option>
            <option value="Study Circle">Study Circle</option>
            <option value="Children's Class">Children's Class</option>
            <option value="Junior Youth Group">Junior Youth Group</option>
            <option value="Consultation">Consultation</option>
            <option value="Coordinators Meeting">Coordinators Meeting</option>
          </select>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70 text-center text-xs font-semibold text-slate-600 py-2.5">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar grid cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {/* Blank offset cells */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`offset-${i}`} className="min-h-[90px] sm:min-h-[110px] bg-slate-50/30 p-1.5" />
            ))}

            {/* Days in month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayActivities = getActivitiesForDay(day);
              const isToday = day === 15 && month === 9; // Oct 15 demonstration current date

              return (
                <div
                  key={`day-${day}`}
                  className={`min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 flex flex-col justify-between transition hover:bg-slate-50/70 ${
                    isToday ? 'bg-blue-50/30 font-medium' : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-mono tabular-nums text-xs ${
                        isToday ? 'bg-slate-900 text-white font-bold' : 'text-slate-700'
                      }`}
                    >
                      {day}
                    </span>
                    {dayActivities.length > 0 && (
                      <span className="hidden sm:inline-block text-[10px] text-slate-400 font-mono">
                        {dayActivities.length} {dayActivities.length === 1 ? 'event' : 'events'}
                      </span>
                    )}
                  </div>

                  {/* Day activity list */}
                  <div className="mt-1 space-y-1 overflow-hidden">
                    {dayActivities.map((act) => (
                      <button
                        key={act.id}
                        type="button"
                        onClick={() => onNavigate(`/activities/${act.id}`)}
                        className="w-full text-left truncate rounded-md bg-slate-100/90 px-1.5 py-0.5 text-[10px] sm:text-[11px] font-medium text-slate-800 hover:bg-slate-200 transition"
                        title={`${act.title} - ${new Date(act.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      >
                        <span className="text-slate-500 mr-1 font-mono">
                          {new Date(act.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>{act.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Week Schedule (October 11 – October 17, 2026)
          </h3>
          <div className="space-y-3 divide-y divide-slate-100">
            {activities
              .filter((act) => {
                const actDate = new Date(act.start_time);
                return actDate.getDate() >= 10 && actDate.getDate() <= 17;
              })
              .map((act) => (
                <div
                  key={act.id}
                  onClick={() => onNavigate(`/activities/${act.id}`)}
                  className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-800 font-mono">
                        {new Date(act.start_time).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span>·</span>
                      <span className="font-mono tabular-nums">
                        {new Date(act.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>·</span>
                      <span>{act.activity_type}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{act.title}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{act.location}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate(`/activities/${act.id}`)}
                    className="self-start sm:self-auto rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    View Details
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs divide-y divide-slate-100">
          {activities.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No scheduled activities match the selected filters.
            </div>
          ) : (
            activities.map((act) => {
              const loc = localities.find((l) => l.id === act.locality_id);
              return (
                <div
                  key={act.id}
                  onClick={() => onNavigate(`/activities/${act.id}`)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition cursor-pointer"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-800">{act.activity_type}</span>
                      <span>·</span>
                      <span>{loc?.name || 'Kimana Cluster'}</span>
                      <span>·</span>
                      <VisibilityBadge visibility={act.visibility} />
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{act.title}</h3>

                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1 font-mono tabular-nums">
                        <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(act.start_time).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono tabular-nums">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(act.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {act.location && (
                        <div className="flex items-center gap-1 text-slate-500 truncate max-w-xs">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{act.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate(`/activities/${act.id}`)}
                    className="self-start sm:self-auto rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Details →
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
