'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';

const pad = (n) => String(n).padStart(2, '0');

const STORAGE_PREFIX = 'schedule_';

function parseTime(t) {
  const [hh, mm] = (t || '00:00').split(':').map(Number);
  return hh * 60 + mm;
}

function minutesToTime(total) {
  total = ((total % 1440) + 1440) % 1440;
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

export default function ScheduleSection() {
  const { user } = useAuthStore();

  const userKey = useMemo(
    () => (user?.id ? `${STORAGE_PREFIX}${user.id}` : `${STORAGE_PREFIX}guest`),
    [user?.id]
  );

  const [entries, setEntries] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  /* ---------------- Load Data ---------------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        if (user?.id) {
          const r = await fetch(`/api/schedule?userId=${user.id}`);
          const data = await r.json();
          if (data?.entries) setEntries(data.entries);
        } else {
          const raw = localStorage.getItem(userKey);
          if (raw) setEntries(JSON.parse(raw));
        }
      } catch (e) {
        console.error('Load error', e);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, [user?.id, userKey]);

  /* ---------------- Persistence ---------------- */
  const persist = useCallback(
    async (next) => {
      setEntries(next);

      try {
        if (user?.id) {
          await fetch('/api/schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, entries: next }),
          });
        } else {
          localStorage.setItem(userKey, JSON.stringify(next));
        }
      } catch (e) {
        console.error('Persistence error', e);
      }
    },
    [user?.id, userKey]
  );

  /* ---------------- Entry Updates ---------------- */
  const updateEntry = (id, partial) => {
    const current = entries[id] ?? {
      text: '',
      duration: 15,
      completed: false,
      start: '08:00',
      end: '08:15',
    };

    const updated = { ...current, ...partial };

    if (partial.start || partial.end) {
      const startMins = parseTime(updated.start);
      const endMins = parseTime(updated.end);
      let diff = endMins - startMins;
      if (diff < 0) diff += 1440;
      updated.duration = diff;
    }

    persist({ ...entries, [id]: updated });
  };

  /* ---------------- Slot Controls ---------------- */
  const addSlot = () => {
    const values = Object.values(entries);
    const lastEntry = values.length ? values[values.length - 1] : undefined;
    const startTime = lastEntry?.end ?? '08:00';

    const newEntry = {
      text: '',
      duration: 15,
      completed: false,
      start: startTime,
      end: minutesToTime(parseTime(startTime) + 15),
    };

    persist({ ...entries, [String(Date.now())]: newEntry });
  };

  const clearSlot = (id) => {
    const next = { ...entries };
    delete next[id];
    persist(next);
  };

  if (!isLoaded) {
    return <div className="p-4 text-gray-500">Loading schedule...</div>;
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-800">Daily Schedule</h3>
        <div className="flex gap-2">
          <button
            onClick={addSlot}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            + Add Task
          </button>
          <button
            onClick={() => persist({})}
            className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md text-sm hover:bg-red-50 hover:text-red-600"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
        {Object.entries(entries)
          .sort((a, b) => parseTime(a[1].start) - parseTime(b[1].start))
          .map(([id, entry]) => (
            <div
              key={id}
              className="grid grid-cols-12 gap-3 items-center p-3 rounded-lg border border-gray-100 bg-gray-50/50"
            >
              <div className="col-span-2">
                <input
                  type="time"
                  value={entry.start}
                  onChange={(e) => updateEntry(id, { start: e.target.value })}
                  className="w-full bg-transparent text-sm font-mono focus:outline-none"
                />
              </div>

              <div className="col-span-1 text-center text-gray-400">→</div>

              <div className="col-span-2">
                <input
                  type="time"
                  value={entry.end}
                  onChange={(e) => updateEntry(id, { end: e.target.value })}
                  className="w-full bg-transparent text-sm font-mono focus:outline-none"
                />
              </div>

              <div className="col-span-5">
                <input
                  type="text"
                  value={entry.text}
                  onChange={(e) => updateEntry(id, { text: e.target.value })}
                  placeholder="What needs to be done?"
                  className={`w-full bg-transparent text-sm focus:outline-none ${
                    entry.completed
                      ? 'line-through text-gray-400'
                      : 'text-gray-700'
                  }`}
                />
              </div>

              <div className="col-span-2 flex justify-end items-center gap-3">
                <input
                  type="checkbox"
                  checked={!!entry.completed}
                  onChange={(e) =>
                    updateEntry(id, { completed: e.target.checked })
                  }
                  className="w-4 h-4 accent-blue-600"
                />
                <button
                  onClick={() => clearSlot(id)}
                  className="text-gray-300 hover:text-red-500 transition-colors text-lg"
                >
                  &times;
                </button>
              </div>
            </div>
          ))}

        {Object.keys(entries).length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-xl">
            No tasks scheduled. Click "+ Add Task" to begin.
          </div>
        )}
      </div>
    </div>
  );
}
