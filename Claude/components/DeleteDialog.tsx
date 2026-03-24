'use client';

interface DeleteDialogProps {
  habitName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteDialog({ habitName, onConfirm, onCancel }: DeleteDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete this habit?</h3>
        <p className="text-sm text-gray-500 mb-6">
          <span className="font-medium text-gray-700">&ldquo;{habitName}&rdquo;</span> and all
          its check-in history will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 min-h-[44px] py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 min-h-[44px] py-3 rounded-xl bg-red-500 text-white font-medium text-sm hover:bg-red-600 active:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
