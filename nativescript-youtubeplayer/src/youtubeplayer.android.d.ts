import { YoutubePlayerBase } from './youtubeplayer.common';
export declare class YoutubePlayer extends YoutubePlayerBase {
    private _pageFragment;
    player: any;
    playerStyle: number;
    private _fullScreen;
    private _fragment;
    private _layoutId;
    private _isInit;
    createNativeView(): globalAndroid.widget.LinearLayout;
    disposeNativeView(): void;
    private initializePlayer;
    play(): void;
    stop(): void;
    destroy(): void;
    pause(): void;
    isPlaying(): boolean;
    toggleFullscreen(): void;
    get isFullScreen(): boolean;
}
