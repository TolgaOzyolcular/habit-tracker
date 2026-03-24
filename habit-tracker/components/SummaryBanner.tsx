'use client';

interface SummaryBannerProps {
  total: number;
  onTrack: number;
  isRestDay: boolean;
}

export function SummaryBanner({ total, onTrack, isRestDay }: SummaryBannerProps) {
  if (total === 0) return null;

  const offTrack = total - onTrack;
  const allOnTrack = offTrack === 0;
  const pct = total > 0 ? Math.round((onTrack / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">
          {total} active habit{total !== 1 ? 's' : ''}
        </span>
        <span className="text-sm font-semibold text-gray-900">
          {onTrack} / {total} On Track
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: allOnTrack ? '#22c55e' : offTrack > onTrack ? '#ef4444' : '#6366f1',
          }}
        />
      </div>

      {isRestDay ? (
        <p className="text-sm text-indigo-600 font-medium">
          🎉 Rest day — no habits scheduled for today
        </p>
      ) : allOnTrack ? (
        <p className="text-sm text-green-600 font-medium">
          🔥 All habits on track — you&apos;re crushing it!
        </p>
      ) : (
        <p className="text-sm text-gray-500">
          {offTrack} habit{offTrack !== 1 ? 's' : ''} off track
        </p>
      )}
    </div>
  );
}
