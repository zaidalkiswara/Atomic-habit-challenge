import React, { useState } from 'react';
import { X, Download, Upload, RotateCcw, ShieldCheck, AlertTriangle, Check } from 'lucide-react';
import { exportDatabaseBackup, importDatabaseBackup, resetDatabaseToDefaults } from '../../db';
import { getTodayDateString } from '../../utils/date';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose, onDataChanged }) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const json = await exportDatabaseBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `atomic-habits-backup-${getTodayDateString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus('Reading backup file...');
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const result = await importDatabaseBackup(text);
        if (result.success) {
          setImportStatus('Backup restored successfully!');
          onDataChanged();
          setTimeout(() => {
            setImportStatus(null);
            onClose();
          }, 1500);
        } else {
          setImportStatus(`Error: ${result.message}`);
        }
      } catch (err) {
        setImportStatus('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    await resetDatabaseToDefaults();
    setConfirmReset(false);
    onDataChanged();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white border border-stone-200 p-6 shadow-xl text-stone-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <div className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
              Data Sovereignty
            </div>
            <h3 className="text-lg font-bold font-editorial text-stone-900">
              Backup & Portability
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Local-First Privacy Notice */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#FAF8F5] border border-amber-950/10 text-xs text-stone-700 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Your daily reflections, habits, and streak metrics are saved locally in your browser’s IndexedDB. No accounts, tracking, or cloud servers.
          </p>
        </div>

        {importStatus && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
            {importStatus}
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 space-y-3">
          {/* Export JSON Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full p-3.5 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-amber-50/40 text-left flex items-center justify-between transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-amber-100 text-stone-700 group-hover:text-amber-900 flex items-center justify-center transition-colors">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-stone-900">Export Backup (JSON)</div>
                <div className="text-[11px] text-stone-500">Download complete habit database</div>
              </div>
            </div>
          </button>

          {/* Import JSON File Input */}
          <label className="w-full p-3.5 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-amber-50/40 text-left flex items-center justify-between transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-amber-100 text-stone-700 group-hover:text-amber-900 flex items-center justify-center transition-colors">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-stone-900">Restore from Backup</div>
                <div className="text-[11px] text-stone-500">Upload a previously exported .json file</div>
              </div>
            </div>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>

          {/* Reset Database */}
          <div className="pt-2">
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-medium text-stone-500 hover:text-rose-700 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Starter Habits</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2">
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Are you sure? This erases all reflections.</span>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-3 py-1.5 rounded-lg bg-rose-700 text-white font-medium hover:bg-rose-800"
                  >
                    Confirm Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-stone-100 text-stone-800 text-xs font-medium hover:bg-stone-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
