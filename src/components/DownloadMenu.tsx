import React, { useState, useRef, useEffect } from 'react';
import { Download, Check, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import type { Quality } from '../types';

interface DownloadMenuProps {
  onDownload: (quality: Quality) => Promise<void>;
  defaultQuality?: Quality;
  className?: string;
  buttonClassName?: string;
  direction?: 'up' | 'down' | 'left';
}

const QUALITY_OPTIONS: Array<{ value: Quality; label: string }> = [
  { value: '128k', label: '标准音质 (128kbps)' },
  { value: '320k', label: '高品质 (320kbps)' },
  { value: 'flac', label: '无损音质 (FLAC)' },
  { value: 'flac24bit', label: 'Hi-Res (FLAC 24bit)' },
];

export const DownloadMenu: React.FC<DownloadMenuProps> = ({
  onDownload,
  defaultQuality = '320k',
  className,
  buttonClassName,
  direction = 'down',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleQualitySelect = async (quality: Quality) => {
    setIsDownloading(true);
    setIsOpen(false);
    try {
      await onDownload(quality);
    } catch (error) {
      console.error('下载失败:', error);
      // 错误由调用方处理（显示toast）
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={clsx("relative", className)} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDownloading}
        className={clsx(
          "p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          buttonClassName
        )}
        title="下载"
      >
        {isDownloading ? (
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <Download size={20} />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[79]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: direction === 'down' ? -10 : 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: direction === 'down' ? -10 : 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={clsx(
                "absolute bg-surface border border-gray-800 rounded-md shadow-xl z-[82] overflow-hidden min-w-[200px]",
                direction === 'down' ? "right-0 top-full mt-2" : direction === 'up' ? "right-0 bottom-full mb-2" : "left-0 top-full mt-2"
              )}
            >
              <div className="px-3 py-2 border-b border-gray-800">
                <div className="text-xs text-gray-400 font-medium">选择音质下载</div>
              </div>
              {QUALITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleQualitySelect(option.value)}
                  disabled={isDownloading}
                  className={clsx(
                    "w-full text-left px-3 py-2.5 text-sm flex items-center justify-between hover:bg-white/10 transition-colors",
                    option.value === defaultQuality ? "text-primary bg-primary/10" : "text-gray-300",
                    isDownloading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span>{option.label}</span>
                  {option.value === defaultQuality && <Check size={14} className="text-primary" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

