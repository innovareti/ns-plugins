import * as app from '@nativescript/core/application';
import { fromObject } from '@nativescript/core/data/observable';
import { Property } from '@nativescript/core/ui/core/view';
import {
    ADSTARTED_EVENT,
    apiKeyProperty,
    BUFFERING_EVENT,
    ENDED_EVENT,
    ERROR_EVENT,
    FULLSCREEN_EVENT,
    LOADING_EVENT,
    PAUSED_EVENT,
    PLAYING_EVENT,
    SEEK_EVENT,
    srcProperty,
    STARTED_EVENT,
    STOPPED_EVENT,
    VIDEO_LOADED_EVENT,
    YoutubePlayerBase
} from './youtubeplayer.common';

declare var com;
const FRAGMENT_TAG = 'TNSYoutubeFragment';
const playerStyleProperty = new Property<YoutubePlayerBase, string>({
    name: 'playerStyle'
});

export class YoutubePlayer extends YoutubePlayerBase {
    private _pageFragment: android.app.Fragment;
    public player: any;
    public playerStyle: number;
    private _fullScreen: boolean;
    private _fragment: any;
    private _layoutId: number;
    private _isInit: boolean;

    public createNativeView() {
        this._layoutId = android.view.View.generateViewId();
        const nativeView = new android.widget.LinearLayout(this._context);
        nativeView.setId(this._layoutId);
        // this uses a private API, but it's the best (or rather: easiest) way I could find to support showing the fragment in modals
        const manager: androidx.fragment.app.FragmentManager = (<any>this)._getFragmentManager();
        const fragment = manager.findFragmentByTag(FRAGMENT_TAG);
        if (!fragment) {
            this._fragment = com.google.android.youtube.player.YouTubePlayerSupportFragment.newInstance();
            manager
                .beginTransaction()
                .replace(this._layoutId, this._fragment, FRAGMENT_TAG)
                .commit();
        } else {
            this._fragment = fragment;
        }
        return nativeView;
    }

    public disposeNativeView(): void {
        this.destroy();
    }

    [srcProperty.setNative](src: string) {
        if (this.player) {
            this.player.cueVideo(src);
        } else {
            this.initializePlayer();
        }
    }

    [apiKeyProperty.setNative](apiKey: string) {
        this.initializePlayer();
    }

    [playerStyleProperty.getDefault](): number {
        return 1;
    }

    [playerStyleProperty.setNative](style: number) {
        if (this.player) {
            switch (style) {
                case 0:
                    this.player.setPlayerStyle(
                        com.google.android.youtube.player.YouTubePlayer.PlayerStyle
                            .CHROMELESS
                    );
                    break;
                case 1:
                    this.player.setPlayerStyle(
                        com.google.android.youtube.player.YouTubePlayer.PlayerStyle.DEFAULT
                    );
                    break;
                case 2:
                    this.player.setPlayerStyle(
                        com.google.android.youtube.player.YouTubePlayer.PlayerStyle.MINIMAL
                    );
                    break;
            }
        }
    }

    private initializePlayer(): void {
        if (!this._isInit && this.apiKey && this.src) {
            this._isInit = true;
            const that = new WeakRef(this);
            const owner = that.get();
            const cb = new com.google.android.youtube.player.YouTubePlayer.OnInitializedListener(
                {
                    onInitializationFailure(provider, error) {
                        owner.notify({
                            eventName: 'error',
                            object: fromObject({ message: error })
                        });
                    },
                    onInitializationSuccess(provider, player, wasRestored) {
                        owner.player = player;
                        const fullScreenCb = new com.google.android.youtube.player.YouTubePlayer.OnFullscreenListener(
                            {
                                onFullscreen(isFullscreen: boolean) {
                                    owner._fullScreen = isFullscreen;
                                    owner.notify({
                                        eventName: FULLSCREEN_EVENT,
                                        object: fromObject({
                                            value: isFullscreen
                                        })
                                    });
                                }
                            }
                        );
                        const playbackEventCb = new com.google.android.youtube.player.YouTubePlayer.PlaybackEventListener(
                            {
                                onBuffering(isBuffering: boolean) {
                                    owner.notify({
                                        eventName: BUFFERING_EVENT,
                                        object: fromObject({
                                            value: isBuffering
                                        })
                                    });
                                },
                                onPaused() {
                                    owner.notify({
                                        eventName: PAUSED_EVENT,
                                        object: fromObject({})
                                    });
                                },
                                onPlaying() {
                                    owner.notify({
                                        eventName: PLAYING_EVENT,
                                        object: fromObject({})
                                    });
                                },
                                onSeekTo(newPositionMillis: number) {
                                    owner.notify({
                                        eventName: SEEK_EVENT,
                                        object: fromObject({
                                            value: newPositionMillis
                                        })
                                    });
                                },
                                onStopped() {
                                    owner.notify({
                                        eventName: STOPPED_EVENT,
                                        object: fromObject({})
                                    });
                                }
                            }
                        );
                        const playerStateChangeCb = new com.google.android.youtube.player.YouTubePlayer.PlayerStateChangeListener(
                            {
                                onAdStarted() {
                                    owner.notify({
                                        eventName: ADSTARTED_EVENT,
                                        object: fromObject({})
                                    });
                                },
                                onError(reason) {
                                    owner.notify({
                                        eventName: ERROR_EVENT,
                                        object: fromObject({
                                            value: reason.toString()
                                        })
                                    });
                                },
                                onLoaded(videoId: string) {
                                    owner.notify({
                                        eventName: VIDEO_LOADED_EVENT,
                                        object: fromObject({
                                            value: videoId
                                        })
                                    });
                                },
                                onLoading() {
                                    owner.notify({
                                        eventName: LOADING_EVENT,
                                        object: fromObject({})
                                    });
                                },
                                onVideoEnded() {
                                    owner.notify({
                                        eventName: ENDED_EVENT,
                                        object: fromObject({})
                                    });
                                },
                                onVideoStarted() {
                                    owner.notify({
                                        eventName: STARTED_EVENT,
                                        object: fromObject({})
                                    });
                                }
                            }
                        );
                        player.setPlayerStateChangeListener(playerStateChangeCb);
                        player.setPlaybackEventListener(playbackEventCb);
                        player.setOnFullscreenListener(fullScreenCb);
                        player.cueVideo(owner.src);
                    }
                }
            );
            this._fragment.initialize(this.apiKey, cb);
        }
    }

    public play(): void {
        if (this.player) {
            this.player.play();
        }
    }

    public stop(): void {
        if (this.player) {
            this.player.release();
        }
    }

    public destroy(): void {
        if (this.player) {
            this.player.release();
            this.player = null;
        }
        if (this._fragment) {
            const activity = app.android.foregroundActivity;
            if (activity && !activity.isFinishing()) {
                (<androidx.fragment.app.FragmentManager>(<any>this)._getFragmentManager())
                    .beginTransaction()
                    .remove(this._fragment)
                    .commit();
                this._fragment = null;
            }
        }
    }

    public pause(): void {
        if (this.player) {
            this.player.pause();
        }
    }

    public isPlaying(): boolean {
        if (this.player) {
            return this.player.isPlaying();
        }
        return false;
    }

    public toggleFullscreen(): void {
        if (this.player) {
            this._fullScreen = !this._fullScreen;
            this.player.setFullscreen(this._fullScreen);
        }
    }

    get isFullScreen(): boolean {
        return this._fullScreen;
    }
}

playerStyleProperty.register(YoutubePlayer);
