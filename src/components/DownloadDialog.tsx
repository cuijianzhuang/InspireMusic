import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Select, type Option } from './ui/Select';
import type { Quality } from '../types';

interface DownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quality: Quality) => Promise<void>;
  songName: string;
  artist?: string;
  defaultQuality?: Quality;
}

const QUALITY_OPTIONS: Option[] = [
  { value: '128k', label: '标准音质 (128kbps)' },
  { value: '320k', label: '高品质 (320kbps)' },
  { value: 'flac', label: '无损音质 (FLAC)' },
  { value: 'flac24bit', label: 'Hi-Res (FLAC 24bit)' },
];

export const DownloadDialog: React.FC<DownloadDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  songName,
  artist,
  defaultQuality = '320k',
}) => {
  const [selectedQuality, setSelectedQuality] = useState<Quality>(defaultQuality);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onConfirm(selectedQuality);
      onClose();
    } catch (error) {
      console.error('下载失败:', error);
      // 错误由调用方处理（显示toast）
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="下载歌曲"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isDownloading}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? '下载中...' : '下载'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="text-gray-400 text-sm mb-1">歌曲</p>
          <p className="text-white font-medium break-words">
            {songName}
            {artist && <span className="text-gray-400 ml-2">- {artist}</span>}
          </p>
        </div>
        <div className="relative">
          <p className="text-gray-400 text-sm mb-2">选择音质</p>
          <Select
            value={selectedQuality}
            onChange={(value) => setSelectedQuality(value as Quality)}
            options={QUALITY_OPTIONS}
          />
        </div>
        <p className="text-gray-500 text-xs">
          提示: 音质越高，文件越大。部分歌曲可能不支持所有音质格式。
        </p>
      </div>
    </Modal>
  );
};

