'use client';

import { useState } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';

interface SyncPanelProps {
  syncCode: string;
  syncing: boolean;
  onChangeSyncCode: (code: string) => Promise<void>;
}

export function SyncPanel({ syncCode, syncing, onChangeSyncCode }: SyncPanelProps) {
  const [copied, setCopied] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [inputCode, setInputCode] = useState('');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = async () => {
    const trimmed = inputCode.trim();
    if (!trimmed) return;
    await onChangeSyncCode(trimmed);
    setShowInput(false);
    setInputCode('');
  };

  return (
    <div className="mt-8 border-t border-gray-100 pt-5 pb-2">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Sync across devices
      </p>

      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs bg-gray-50 rounded-xl px-3 py-2.5 text-gray-600 font-mono truncate border border-gray-100">
          {syncCode || '—'}
        </code>
        <button
          onClick={handleCopy}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-600 transition-colors"
          aria-label="Copy sync code"
        >
          {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-2">
        Copy this code and enter it on your other device to share the same habits.
      </p>

      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          className="mt-2 text-xs text-indigo-500 hover:text-indigo-700 transition-colors min-h-[36px] block"
        >
          Use a different code →
        </button>
      ) : (
        <div className="mt-3 space-y-2">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Paste sync code…"
            className="w-full px-3 min-h-[44px] rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleApply}
              disabled={syncing || !inputCode.trim()}
              className="flex-1 min-h-[44px] rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              {syncing ? <RefreshCw size={14} className="animate-spin" /> : null}
              Apply
            </button>
            <button
              onClick={() => { setShowInput(false); setInputCode(''); }}
              className="flex-1 min-h-[44px] rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
