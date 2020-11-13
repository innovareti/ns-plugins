import { Common } from "./cscreenshot.common";
import { ImageSource, ViewBase } from "@nativescript/core";
import { fromData } from "@nativescript/core/image-source";

export class Cscreenshot extends Common {
    take(view: ViewBase, callback: any) {
        let iosView = view.ios.view ? view.ios.view : view.ios;
        UIGraphicsBeginImageContextWithOptions(iosView.frame.size, false, 0);
        iosView.drawViewHierarchyInRectAfterScreenUpdates(CGRectMake(0, 0, iosView.frame.size.width, iosView.frame.size.height), true);
        const imageFromCurrentImageContext = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
        callback(<ImageSource>fromData(UIImagePNGRepresentation(imageFromCurrentImageContext)));
    }
}
