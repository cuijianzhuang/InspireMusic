import React, { useState, useEffect } from 'react';
import { Import, Plus, Heart, ListMusic, Headphones, Timer, Play, Clock, X } from 'lucide-react';
import { Select } from './ui/Select';
import type { Song, LocalPlaylist, Platform, Quality } from '../types';
import { getGradientFromId } from '../utils/colors';

interface LibraryViewProps {
    playlists: LocalPlaylist[];
    favorites: Song[];
    playlistSource: Platform;
    onPlaylistSourceChange: (source: Platform) => void;
    onImportPlaylist: (id: string) => void;
    loadingPlaylist: boolean;
    onCreatePlaylist: () => void;
    onSelectPlaylist: (playlist: LocalPlaylist) => void;
    onPlayFavorites: () => void;
    onPlayPlaylist: (playlist: LocalPlaylist) => void;

    // New Features
    quality: Quality;
    onQualityChange: (q: Quality) => void;

    sleepEndTime: number | null;
    onSetSleepTimer: (minutes: number) => void;
    onCancelSleepTimer: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
    playlists,
    favorites,
    playlistSource,
    onPlaylistSourceChange,
    onImportPlaylist,
    loadingPlaylist,
    onCreatePlaylist,
    onSelectPlaylist,
    onPlayFavorites,
    onPlayPlaylist,
    quality,
    onQualityChange,
    sleepEndTime,
    onSetSleepTimer,
    onCancelSleepTimer
}) => {
    const [importId, setImportId] = useState('');
    const [customTimer, setCustomTimer] = useState('');
    const [showCustomTimer, setShowCustomTimer] = useState(false);

    // Timer countdown display
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        if (!sleepEndTime) {
            setTimeLeft('');
            return;
        }

        const updateTimer = () => {
            const now = Date.now();
            const diff = Math.max(0, Math.ceil((sleepEndTime - now) / 1000));

            if (diff <= 0) {
                setTimeLeft('00:00');
            } else {
                const mins = Math.floor(diff / 60);
                const secs = diff % 60;
                setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [sleepEndTime]);

    const handleCustomTimerSubmit = () => {
        const mins = parseInt(customTimer);
        if (!isNaN(mins) && mins > 0 && mins <= 180) {
            onSetSleepTimer(mins);
            setShowCustomTimer(false);
            setCustomTimer('');
        }
    };

    return (
        <div className="p-4 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">音乐库</h2>
            </div>

            {/* Settings Section */}
            <div className="bg-surface p-4 md:p-6 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sound Quality */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Headphones size={20} />
                        音质设置
                    </h3>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400 text-sm">选择默认播放音质：</span>
                        <Select
                            value={quality}
                            onChange={(val) => onQualityChange(val as Quality)}
                            options={[
                                { value: '128k', label: '标准 (128k)' },
                                { value: '320k', label: '高品 (320k)' },
                                { value: 'flac', label: '无损 (FLAC)' },
                                { value: 'flac24bit', label: 'Hi-Res (24bit)' },
                            ]}
                            className="w-40"
                        />
                    </div>
                </div>

                {/* Sleep Timer */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Timer size={20} />
                        定时停止播放
                    </h3>

                    {sleepEndTime ? (
                        <div className="flex items-center gap-4 bg-primary/10 border border-primary/20 rounded-lg p-3">
                            <Clock size={20} className="text-primary" />
                            <div className="flex-1">
                                <div className="text-white font-medium">定时已开启</div>
                                <div className="text-primary font-mono text-xl font-bold">{timeLeft}</div>
                            </div>
                            <button
                                onClick={onCancelSleepTimer}
                                className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                                title="取消定时"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {[15, 30, 60].map((min) => (
                                <button
                                    key={min}
                                    onClick={() => onSetSleepTimer(min)}
                                    className="px-3 py-1.5 bg-black/20 hover:bg-black/40 text-gray-300 hover:text-white rounded text-sm transition-colors border border-transparent hover:border-gray-700"
                                >
                                    {min}分钟
                                </button>
                            ))}

                            {showCustomTimer ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        max="180"
                                        placeholder="分钟"
                                        value={customTimer}
                                        onChange={(e) => setCustomTimer(e.target.value)}
                                        className="w-20 bg-black/20 text-white text-sm px-2 py-1.5 rounded outline-none border border-primary/50"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleCustomTimerSubmit()}
                                    />
                                    <button
                                        onClick={handleCustomTimerSubmit}
                                        className="text-primary hover:text-primary/80 text-sm font-medium"
                                    >
                                        确定
                                    </button>
                                    <button
                                        onClick={() => setShowCustomTimer(false)}
                                        className="text-gray-400 hover:text-white text-sm"
                                    >
                                        取消
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowCustomTimer(true)}
                                    className="px-3 py-1.5 bg-black/20 hover:bg-black/40 text-gray-300 hover:text-white rounded text-sm transition-colors border border-transparent hover:border-gray-700"
                                >
                                    自定义
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Import Section */}
            <div className="bg-surface p-4 md:p-6 rounded-xl mb-8">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Import size={20} />
                    导入外部歌单
                </h3>
                <div className="flex flex-col md:flex-row gap-4">
                    <Select
                        value={playlistSource}
                        onChange={(val) => onPlaylistSourceChange(val as Platform)}
                        options={[
                            { value: 'netease', label: '网易云' },
                            { value: 'kuwo', label: '酷我' },
                            { value: 'qq', label: 'QQ音乐' },
                        ]}
                        className="w-full md:w-32"
                    />
                    <input
                        type="text"
                        value={importId}
                        onChange={(e) => setImportId(e.target.value)}
                        placeholder="输入歌单 ID"
                        className="flex-1 bg-black/20 text-white rounded-md px-4 py-2 outline-none border border-transparent focus:border-primary/50 transition-colors w-full"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && importId.trim()) {
                                onImportPlaylist(importId.trim());
                                setImportId('');
                            }
                        }}
                    />
                    <button
                        onClick={() => {
                            if (importId.trim()) {
                                onImportPlaylist(importId.trim());
                                setImportId('');
                            }
                        }}
                        disabled={loadingPlaylist}
                        className="bg-primary text-black font-bold px-6 py-2 rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                        {loadingPlaylist ? '导入中...' : '导入'}
                    </button>
                </div>
            </div>

            {/* Playlist Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Favorites Card */}
                <div
                    onClick={() => {
                        const favPlaylist: LocalPlaylist = {
                            id: 'favorites',
                            name: '我喜欢的音乐',
                            songs: favorites,
                            source: 'netease'
                        };
                        onSelectPlaylist(favPlaylist);
                    }}
                    className="group bg-gradient-to-br from-purple-900 to-blue-900 hover:brightness-110 rounded-lg p-4 cursor-pointer transition-all"
                >
                    <div className="aspect-square rounded-md mb-4 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg">
                        <Heart size={48} fill="white" className="text-white" />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onPlayFavorites();
                            }}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                                <Play fill="black" className="text-black ml-1" />
                            </div>
                        </button>
                    </div>
                    <h3 className="text-white font-bold truncate">我喜欢的音乐</h3>
                    <p className="text-gray-400 text-sm">{favorites.length} 首歌曲</p>
                </div>

                {/* User Playlists */}
                {playlists.map((pl) => (
                    <div
                        key={pl.id}
                        onClick={() => onSelectPlaylist(pl)}
                        className="group bg-surface hover:bg-surface/80 rounded-lg p-4 cursor-pointer transition-colors"
                    >
                        <div className={`aspect-square rounded-md mb-4 flex items-center justify-center relative overflow-hidden ${getGradientFromId(pl.id)}`}>
                            <ListMusic size={48} className="text-white/50" />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPlayPlaylist(pl);
                                }}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                                    <Play fill="black" className="text-black ml-1" />
                                </div>
                            </button>
                        </div>
                        <h3 className="text-white font-bold truncate">{pl.name}</h3>
                        <p className="text-gray-400 text-sm">{pl.songs.length} 首歌曲</p>
                    </div>
                ))}

                {/* New Playlist Card */}
                <div
                    onClick={onCreatePlaylist}
                    className="border-2 border-dashed border-gray-700 hover:border-gray-500 rounded-lg p-4 cursor-pointer transition-colors flex flex-col items-center justify-center gap-4 min-h-[200px]"
                >
                    <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                        <Plus size={32} />
                    </div>
                    <span className="text-gray-400 font-medium">新建歌单</span>
                </div>
            </div>
        </div>
    );
};
