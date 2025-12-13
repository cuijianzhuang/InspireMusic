import React from 'react';
import type { Song, LocalPlaylist, Platform, Quality } from '../types';
import { QualitySettingsSection } from './library/QualitySettingsSection';
import { SleepTimerSection } from './library/SleepTimerSection';
import { ImportPlaylistSection } from './library/ImportPlaylistSection';
import { PlaylistGrid } from './library/PlaylistGrid';
import { ClearCacheSection } from './library/ClearCacheSection';
import { PageLayout } from './ui/PageLayout';

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
    return (
        <PageLayout title="音乐库">
            {/* Settings Section */}
            <div className="bg-surface p-4 md:p-6 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <QualitySettingsSection
                    quality={quality}
                    onQualityChange={onQualityChange}
                />
                <SleepTimerSection
                    sleepEndTime={sleepEndTime}
                    onSetSleepTimer={onSetSleepTimer}
                    onCancelSleepTimer={onCancelSleepTimer}
                />
                <ClearCacheSection />
            </div>

            {/* Import Section */}
            <ImportPlaylistSection
                playlistSource={playlistSource}
                onPlaylistSourceChange={onPlaylistSourceChange}
                onImportPlaylist={onImportPlaylist}
                loadingPlaylist={loadingPlaylist}
            />

            {/* Playlist Grid */}
            <PlaylistGrid
                playlists={playlists}
                favorites={favorites}
                onSelectPlaylist={onSelectPlaylist}
                onPlayFavorites={onPlayFavorites}
                onPlayPlaylist={onPlayPlaylist}
                onCreatePlaylist={onCreatePlaylist}
            />
        </PageLayout>
    );
};
