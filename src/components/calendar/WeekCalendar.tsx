'use client';

import { CalendarSlot, Post, CHANNEL_META, PHASE_META, STATUS_META } from '@/lib/types';

interface Props {
  slots: CalendarSlot[];
  posts: Post[];
  weekStart: Date;
  onSlotClick: (slot: CalendarSlot) => void;
  onEmptyClick: (date: string) => void;
}

function getWeekDates(start: Date): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

export default function WeekCalendar({ slots, posts, weekStart, onSlotClick, onEmptyClick }: Props) {
  const weekDates = getWeekDates(weekStart);

  return (
    <div className="grid grid-cols-7 gap-1">
      {weekDates.map(date => {
        const dateStr = formatDate(date);
        const daySlots = slots.filter(s => s.date === dateStr);
        const isToday = formatDate(new Date()) === dateStr;

        return (
          <div
            key={dateStr}
            className={`min-h-[120px] bg-[#161412] border rounded-md p-2 ${
              isToday ? 'border-[#C8A96E]' : 'border-[#2A2520]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] ${isToday ? 'text-[#C8A96E] font-medium' : 'text-[#6A6058]'}`}>
                {date.getMonth() + 1}/{date.getDate()}
              </span>
              <span className={`text-[10px] ${isToday ? 'text-[#C8A96E]' : 'text-[#4A4840]'}`}>
                {DAY_NAMES[date.getDay()]}
              </span>
            </div>

            <div className="space-y-1">
              {daySlots.map(slot => {
                const ch = CHANNEL_META[slot.channel];
                const ph = PHASE_META[slot.phase];
                const post = slot.postId ? posts.find(p => p.id === slot.postId) : null;

                return (
                  <button
                    key={slot.id}
                    onClick={() => onSlotClick(slot)}
                    className="w-full text-left px-1.5 py-1 rounded text-[10px] hover:bg-[#1E1C18] transition-colors"
                    style={{ borderLeft: `2px solid ${ph.color}` }}
                  >
                    <div className="flex items-center gap-1">
                      <span style={{ color: ch.color }}>{ch.icon}</span>
                      <span className="text-[#A09080] truncate">{slot.theme}</span>
                    </div>
                    {post && (
                      <span
                        className="text-[9px] ml-3"
                        style={{ color: STATUS_META[post.status].color }}
                      >
                        {STATUS_META[post.status].label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onEmptyClick(dateStr)}
              className="w-full mt-1 text-[10px] text-[#3A3530] hover:text-[#6A6058] transition-colors text-center py-1"
            >
              +
            </button>
          </div>
        );
      })}
    </div>
  );
}
