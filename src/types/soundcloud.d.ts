// SoundCloud Widget API Type Declarations
// https://developers.soundcloud.com/docs/api/html5-widget

declare global {
  interface Window {
    SC: {
      Widget: SoundCloudWidgetConstructor;
    };
  }
}

interface SoundCloudWidgetConstructor {
  (iframe: HTMLIFrameElement): SoundCloudWidget;
  Events: {
    READY: string;
    PLAY: string;
    PAUSE: string;
    FINISH: string;
    PLAY_PROGRESS: string;
    SEEK: string;
    LOAD_PROGRESS: string;
    ERROR: string;
  };
}

interface SoundCloudWidget {
  bind(event: string, callback: (data?: any) => void): void;
  unbind(event: string): void;
  load(url: string, options?: SoundCloudLoadOptions): void;
  play(): void;
  pause(): void;
  toggle(): void;
  seekTo(milliseconds: number): void;
  setVolume(volume: number): void;
  getVolume(callback: (volume: number) => void): void;
  getDuration(callback: (duration: number) => void): void;
  getPosition(callback: (position: number) => void): void;
  getSounds(callback: (sounds: any[]) => void): void;
  getCurrentSound(callback: (sound: any) => void): void;
  getCurrentSoundIndex(callback: (index: number) => void): void;
  isPaused(callback: (paused: boolean) => void): void;
  skip(soundIndex: number): void;
  next(): void;
  prev(): void;
}

interface SoundCloudLoadOptions {
  auto_play?: boolean;
  buying?: boolean;
  liking?: boolean;
  download?: boolean;
  sharing?: boolean;
  show_artwork?: boolean;
  show_comments?: boolean;
  show_playcount?: boolean;
  show_user?: boolean;
  start_track?: number;
  single_active?: boolean;
  callback?: () => void;
}

export {};
