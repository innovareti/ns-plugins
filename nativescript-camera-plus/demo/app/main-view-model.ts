import { Observable } from '@nativescript/core/data/observable';
import { ImageAsset } from '@nativescript/core/image-asset';
import { ImageSource } from '@nativescript/core/image-source';
import { Screen } from '@nativescript/core/platform';
import { Frame } from '@nativescript/core/ui/frame';
import { Image } from '@nativescript/core/ui/image';
import { Page } from '@nativescript/core/ui/page';
import { CameraPlus } from '@nstudio/nativescript-camera-plus';
import { ObservableProperty } from './observable-property';

export class HelloWorldModel extends Observable {
  private _counter: number = 0;
  @ObservableProperty()
  public cam: CameraPlus;
  @ObservableProperty()
  public cameraHeight: number;

  constructor(page: Page) {
    super();

    this.cam = page.getViewById('camPlus') as unknown as CameraPlus;

    // hide a default icon button here
    // this.cam.showGalleryIcon = false

    this.cameraHeight = Screen.mainScreen.heightDIPs * 0.6;

    if (this._counter > 0) {
      return;
    }

    this.cam.on(CameraPlus.errorEvent, args => {
      console.log('*** CameraPlus errorEvent ***', args);
    });

    this.cam.on(CameraPlus.toggleCameraEvent, (args: any) => {
      console.log(`toggleCameraEvent listener on main-view-model.ts  ${args}`);
    });

    this.cam.on(CameraPlus.photoCapturedEvent, (args: any) => {
      console.log(`photoCapturedEvent listener on main-view-model.ts  ${args}`);
      console.log((<any>args).data);
      ImageSource.fromAsset((<any>args).data).then(res => {
        const testImg = Frame.topmost().getViewById('testImagePickResult') as Image;
        testImg.src = res;
      });
    });

    this.cam.on(CameraPlus.imagesSelectedEvent, (args: any) => {
      console.log(`imagesSelectedEvent listener on main-view-model.ts ${args}`);
    });

    this.cam.on(CameraPlus.videoRecordingReadyEvent, (args: any) => {
      console.log(`videoRecordingReadyEvent listener fired`, args.data);
    });

    this.cam.on(CameraPlus.videoRecordingStartedEvent, (args: any) => {
      console.log(`videoRecordingStartedEvent listener fired`, args.data);
    });

    this.cam.on(CameraPlus.videoRecordingFinishedEvent, (args: any) => {
      console.log(`videoRecordingFinishedEvent listener fired`, args.data);
    });

    this._counter = 1;
  }

  public recordDemoVideo() {
    try {
      console.log(`*** start recording ***`);
      this.cam.record({
        saveToGallery: true
      });
    } catch (err) {
      console.log(err);
    }
  }

  public stopRecordingDemoVideo() {
    try {
      console.log(`*** stop recording ***`);
      this.cam.stop();
      console.log(`*** after this.cam.stop() ***`);
    } catch (err) {
      console.log(err);
    }
  }

  public toggleFlashOnCam() {
    this.cam.toggleFlash();
  }

  public toggleShowingFlashIcon() {
    console.log(`showFlashIcon = ${this.cam.showFlashIcon}`);
    this.cam.showFlashIcon = !this.cam.showFlashIcon;
  }

  public toggleTheCamera() {
    this.cam.toggleCamera();
  }

  public openCamPlusLibrary() {
    this.cam.chooseFromLibrary().then(
      (images: Array<ImageAsset>) => {
        console.log('Images selected from library total:', images.length);
        for (const source of images) {
          console.log(`source = ${source}`);
        }
        const testImg = Frame.topmost().getViewById('testImagePickResult') as Image;
        const firstImg = images[0];
        console.log(firstImg);
        ImageSource.fromAsset(firstImg)
          .then(res => {
            const testImg = Frame.topmost().getViewById('testImagePickResult') as Image;
            testImg.src = res;
          })
          .catch(err => {
            console.log(err);
          });
      },
      err => {
        console.log('Error -> ' + err.message);
      }
    );
  }

  public takePicFromCam() {
    this.cam.requestCameraPermissions().then(() => {
      if (!this.cam) {
        this.cam = new CameraPlus();
      }
      this.cam.takePicture({ saveToGallery: true });
    });
  }
}
