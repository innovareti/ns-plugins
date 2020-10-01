import { ObservableArray } from "tns-core-modules/data/observable-array";
import { isIOS } from "tns-core-modules/platform";
import { Property, View } from "tns-core-modules/ui/core/view";
import * as enums from "tns-core-modules/ui/enums";
import * as frame from "tns-core-modules/ui/frame";
import { GridLayout } from "tns-core-modules/ui/layouts/grid-layout";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import { TextField } from "tns-core-modules/ui/text-field";

const builder = require("tns-core-modules/ui/builder");

const unfilteredSource: Array<any> = [];
let filtering: boolean = false;
export const listWidthProperty = new Property<FilterableListpicker, string>({ name: "listWidth", defaultValue: "300" });
export const listHeightProperty = new Property<FilterableListpicker, string>({ name: "listHeight", defaultValue: "300" });
export const dimmerColorProperty = new Property<FilterableListpicker, string>({ name: "dimmerColor", defaultValue: "rgba(0,0,0,0.8)" });
export const blurProperty = new Property<FilterableListpicker, string>({ name: "blur", defaultValue: "none" });
export const focusOnShowProperty = new Property<FilterableListpicker, boolean>({ name: "focusOnShow", defaultValue: false });
export const hideFilterProperty = new Property<FilterableListpicker, boolean>({ name: "hideFilter", defaultValue: false });
export const hintTextProperty = new Property<FilterableListpicker, string>({ name: "hintText", defaultValue: "Enter text to filter..." });
export const sourceProperty = new Property<FilterableListpicker, ObservableArray<any>>(
    {
        name: "source", defaultValue: undefined, affectsLayout: true, valueChanged: (target, oldValue, newValue) => {
            if (!filtering) {
                while (unfilteredSource.length) {
                    unfilteredSource.pop();
                }
                newValue.forEach((element) => {
                    unfilteredSource.push(element);
                });
            }
        }
    }
);

export class FilterableListpicker extends GridLayout {

    static canceledEvent = "canceled";
    static itemTappedEvent = "itemTapped";
    source: any;
    dimmerColor: any;
    hintText: any;
    hideFilter: any;
    blur: any;
    focusOnShow: any;

    visibility: any = enums.Visibility.collapse;

    private blurView: any = false;

    constructor() {
        super();
        let innerComponent;
        innerComponent = builder.parse(`
            <GridLayout id="dc_flp_container" visibility="collapsed">
                <StackLayout tap="{{cancel}}" width="100%" height="100%"></StackLayout>
                <GridLayout width="{{listWidth}}" verticalAlignment="middle" rows="40, auto, 40" id="dc_flp" style="border-radius: 10;">
                    <TextField hint="{{hintText}}" row="0" text="{{filterText}}" id="filterTextField" style="padding: 10 15; height: 40; background-color: #E0E0E0; border-radius: 10 10 0 0;"></TextField>
                    <ListView items="{{ source }}" row="1" height="{{listHeight}}" itemTap="{{choose}}" style="background-color: white;">
                        <ListView.itemTemplate>
                            <StackLayout>
                                <GridLayout rows="*" columns="*" visibility="{{ name ? 'visible' : 'collapsed' }}" style="margin: 10 10 10 5;" col="1" verticalAlignment="middle">
                                    <Label row="0" text="{{ name }}" width="100%" textWrap="true" paddingRight="20" style="font-weight: bold; font-size: 16;"></Label>
                                    <Image row="0" height="20" src="{{ icon }}" verticalAlignment="middle" horizontalAlignment="right" marginRigth="4" />
                                </GridLayout>
                            </StackLayout>
                        </ListView.itemTemplate>
                    </ListView>
                    <StackLayout row="2" height="40" style="background-color: #E0E0E0; height: 40; border-radius: 0 0 10 10;">
                        <Button text="Cancelar" tap="{{cancel}}" verticalAlignment="middle" style="font-weight: bold; height: 40; background-color: transparent; background-color: transparent; border-color: transparent; border-width: 1; font-size: 12;"></Button>
                    </StackLayout>
                </GridLayout>
            </GridLayout>`
        );

        innerComponent.bindingContext = this;
        this.addChild(innerComponent);
        const textfield: TextField = <TextField>innerComponent.getViewById("filterTextField");
        textfield.on("textChange", (data: any) => {
            filtering = true;
            this.source = unfilteredSource.filter((item) => {
                return item.name.toLowerCase().indexOf(data.value.toLowerCase()) !== -1;
            });

            if (this.source.length === 0) {
                if (data.value) {
                    const tempSource = new Array<any>();
                    tempSource.push({ name: data.value });
                    this.source = tempSource;
                }
            }

            filtering = false;
        });
    }

    choose(args) {
        const item = this.source[args.index];
        this.hide();
        this.notify({
            eventName: "itemTapped",
            object: this,
            selectedItem: item
        });
    }

    cancel() {
        this.notify({
            eventName: "canceled",
            object: this
        });
        this.hide();
    }

    hide() {
        const textField: TextField = <TextField>frame.topmost().getViewById("filterTextField");
        if (textField.dismissSoftInput) {
            textField.dismissSoftInput();
        }
        textField.text = "";
        const container: GridLayout = frame.topmost().getViewById("dc_flp_container") as GridLayout;
        const picker: StackLayout = frame.topmost().getViewById("dc_flp") as StackLayout;
        if (this.blurView) {
            UIView.animateWithDurationAnimationsCompletion(.3, () => {
                this.blurView.effect = null;
            }, () => {
                this.blurView.removeFromSuperview();
            });
        } else {
            container.animate({
                opacity: 0,
                duration: 200
            });
        }

        return picker.animate({
            scale: { x: .7, y: .7 },
            opacity: 0,
            duration: 400,
            curve: enums.AnimationCurve.cubicBezier(0.1, 0.1, 0.1, 1)
        }).then(() => {
            this.visibility = enums.Visibility.collapse;
            container.visibility = "collapse";
        });
    }

    show() {
        const container: GridLayout = frame.topmost().getViewById("dc_flp_container") as GridLayout;
        const picker: StackLayout = frame.topmost().getViewById("dc_flp") as StackLayout;
        this.visibility = enums.Visibility.visible;
        container.visibility = "visible";

        if (isIOS && this.blur && this.blur !== "none") {
            const iosView: UIView = container.ios;
            const effectView = UIVisualEffectView.alloc().init();
            effectView.frame = CGRectMake(0, 0, iosView.bounds.size.width, iosView.bounds.size.height);
            // tslint:disable-next-line:no-bitwise
            effectView.autoresizingMask = UIViewAutoresizing.FlexibleWidth | UIViewAutoresizing.FlexibleHeight;
            this.blurView = effectView;
            iosView.addSubview(effectView);
            iosView.sendSubviewToBack(effectView);
            UIView.animateWithDurationAnimationsCompletion(.3, () => {
                let theme = UIBlurEffectStyle.Dark;
                if (this.blur === "light") { theme = UIBlurEffectStyle.Light; }
                effectView.effect = UIBlurEffect.effectWithStyle(theme);
            }, () => {
                // the animation is complete.
            });
        } else {
            container.opacity = 0;
            container.backgroundColor = this.dimmerColor;
            container.animate({
                opacity: 1,
                duration: 200
            });
        }

        picker.scaleX = .7;
        picker.scaleY = .7;
        picker.opacity = 0;
        picker.animate({
            scale: { x: 1, y: 1 },
            opacity: 1,
            duration: 400,
            curve: enums.AnimationCurve.cubicBezier(0.1, 0.1, 0.1, 1)
        });

        const textField: TextField = <TextField>frame.topmost().getViewById("filterTextField");
        if (JSON.parse(this.focusOnShow)) {
            textField.focus();
        }
    }

}

listWidthProperty.register(FilterableListpicker);
listHeightProperty.register(FilterableListpicker);
dimmerColorProperty.register(FilterableListpicker);
focusOnShowProperty.register(FilterableListpicker);
hideFilterProperty.register(FilterableListpicker);
blurProperty.register(FilterableListpicker);
hintTextProperty.register(FilterableListpicker);
sourceProperty.register(FilterableListpicker);
