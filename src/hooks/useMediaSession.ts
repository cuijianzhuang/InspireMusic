import { useEffect, useRef } from 'react';

interface UseMediaSessionOptions {
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  duration: number;
  position: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onSeek: (time: number) => void;
}

/**
 * Custom hook to integrate with the Media Session API.
 * Displays current track info in browser/OS media notifications
 * and handles media key controls.
 */
export function useMediaSession({
  title,
  artist,
  album,
  artwork,
  duration,
  position,
  isPlaying,
  onPlay,
  onPause,
  onNextTrack,
  onPrevTrack,
  onSeek,
}: UseMediaSessionOptions): void {
  // Keep refs to latest callbacks to avoid re-registering handlers
  const callbacksRef = useRef({ onPlay, onPause, onNextTrack, onPrevTrack, onSeek });
  
  useEffect(() => {
    callbacksRef.current = { onPlay, onPause, onNextTrack, onPrevTrack, onSeek };
  });

  // Register action handlers once
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const mediaSession = navigator.mediaSession;

    // Play action
    mediaSession.setActionHandler('play', () => {
      callbacksRef.current.onPlay();
    });

    // Pause action
    mediaSession.setActionHandler('pause', () => {
      callbacksRef.current.onPause();
    });

    // Next track action
    mediaSession.setActionHandler('nexttrack', () => {
      callbacksRef.current.onNextTrack();
    });

    // Previous track action
    mediaSession.setActionHandler('previoustrack', () => {
      callbacksRef.current.onPrevTrack();
    });

    // Seek to specific time action
    mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        callbacksRef.current.onSeek(details.seekTime);
      }
    });

    // Cleanup handlers on unmount
    return () => {
      mediaSession.setActionHandler('play', null);
      mediaSession.setActionHandler('pause', null);
      mediaSession.setActionHandler('nexttrack', null);
      mediaSession.setActionHandler('previoustrack', null);
      mediaSession.setActionHandler('seekto', null);
    };
  }, []);

  // Update metadata when track info changes
  useEffect(() => {
    if (!('mediaSession' in navigator) || !title) return;

    const artworkArray: MediaImage[] = artwork
      ? [
          { src: artwork, sizes: '512x512', type: 'image/jpeg' },
          { src: artwork, sizes: '256x256', type: 'image/jpeg' },
          { src: artwork, sizes: '128x128', type: 'image/jpeg' },
        ]
      : [];

    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album: album || '',
      artwork: artworkArray,
    });
  }, [title, artist, album, artwork]);

  // Update playback state
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  // Update position state for seek bar support
  useEffect(() => {
    if (!('mediaSession' in navigator) || !duration || duration <= 0) return;

    try {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: 1,
        position: Math.min(position, duration),
      });
    } catch {
      // Some browsers may not support setPositionState
    }
  }, [duration, position]);
}
