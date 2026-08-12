/**
 * Settings Component
 * Displays download directory path and concurrent limit slider
 * Shows "Select Folder" button to change download directory
 * Validates: Requirements 11.4, 12.1, 12.2, 12.3, 12.4, 12.5, 21.1, 21.2, 21.3, 21.4, 21.5, 18.1, 18.2, 18.3, 18.4, 18.5
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Folder, Settings as SettingsIcon } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useIPC } from '../hooks/useIPC';
import { AppUpdate } from './AppUpdate';

export const Settings: React.FC = () => {
  const { settings } = useAppStore();
  const { selectFolder, updateSettings } = useIPC();
  const [isOpen, setIsOpen] = useState(false);

  const handleConcurrentLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    updateSettings({ concurrentLimit: value });
  };

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const PANEL_WIDTH = 384; // matches tailwind w-96
    const margin = 16;
    const rawLeft = rect.left + window.scrollX;
    const maxLeft = Math.max(8, window.innerWidth - PANEL_WIDTH - margin);
    const left = Math.min(Math.max(rawLeft, 8), maxLeft);
    setPosition({ top: rect.bottom + window.scrollY + 8, left, width: rect.width });

    const handleResize = () => {
      const r = buttonRef.current?.getBoundingClientRect();
      if (r) {
        const raw = r.left + window.scrollX;
        const maxL = Math.max(8, window.innerWidth - 384 - 16);
        const clamped = Math.min(Math.max(raw, 8), maxL);
        setPosition({ top: r.bottom + window.scrollY + 8, left: clamped, width: r.width });
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [isOpen]);

  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current && !panelRef.current.contains(target) && !buttonRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  return (
    <div className="relative w-auto flex-shrink-0">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-gray-800 dark:text-gray-200"
        aria-label="Settings"
        title="Settings"
      >
        <SettingsIcon className="w-5 h-5" />
        <span className="hidden sm:inline font-medium">Settings</span>
      </button>

      {isOpen && position && createPortal(
        <div
          ref={panelRef}
          style={{ position: 'absolute', top: position.top, left: position.left }}
          className="z-40 w-96 max-w-[calc(100%-32px)] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 shadow-2xl"
        >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Download Directory
              </label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm">
                  <Folder className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{settings.downloadDirectory || 'Not set'}</span>
                </div>
                <button
                  onClick={selectFolder}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
                >
                  Select Folder
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Concurrent Downloads: {settings.concurrentLimit}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={settings.concurrentLimit}
                onChange={handleConcurrentLimitChange}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Concurrent downloads control how many files download simultaneously. Higher values may use more bandwidth and system resources.
            </p>

            <AppUpdate />
          </div>,
        document.body
      )}
    </div>
  );
};
