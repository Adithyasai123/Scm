import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001E2B]/45 backdrop-blur-xs p-4">
      <div className="w-full max-w-[420px] bg-surface rounded-[12px] shadow-[var(--shadow-modal)] border border-border overflow-hidden">
        <div className="p-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center space-x-2.5">
              <div
                className={`p-1.5 rounded-md ${
                  isDestructive ? 'bg-[#FDF2F2] text-[#DB3030]' : 'bg-accent/10 text-accent'
                }`}
              >
                <AlertTriangle className="w-4 h-4" strokeWidth={2} />
              </div>
              <h3 className="text-sm font-bold text-foreground">{title}</h3>
            </div>
            <button
              onClick={onCancel}
              className="text-muted-fg/70 hover:text-foreground p-1 rounded-md transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" strokeWidth={1.8} />
            </button>
          </div>
          <p className="text-xs text-muted-fg mt-3.5 leading-relaxed">{description}</p>
        </div>
        <div className="bg-background px-5 py-3.5 flex items-center justify-end space-x-2.5 border-t border-border">
          <button
            onClick={onCancel}
            type="button"
            className="px-3.5 py-1.5 text-xs font-semibold text-foreground bg-surface border border-border rounded-md hover:bg-surface-alt transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className={`px-3.5 py-1.5 text-xs font-semibold text-white rounded-md transition-colors ${
              isDestructive ? 'bg-[#DB3030] hover:bg-[#B82525]' : 'bg-accent hover:bg-[#0369A1]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

