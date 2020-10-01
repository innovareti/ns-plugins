"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterableListpicker = exports.sourceProperty = exports.hintTextProperty = exports.hideFilterProperty = exports.focusOnShowProperty = exports.blurProperty = exports.dimmerColorProperty = exports.listHeightProperty = exports.listWidthProperty = void 0;
var platform_1 = require("tns-core-modules/platform");
var view_1 = require("tns-core-modules/ui/core/view");
var enums = require("tns-core-modules/ui/enums");
var frame = require("tns-core-modules/ui/frame");
var grid_layout_1 = require("tns-core-modules/ui/layouts/grid-layout");
var builder = require("tns-core-modules/ui/builder");
var unfilteredSource = [];
var filtering = false;
exports.listWidthProperty = new view_1.Property({ name: "listWidth", defaultValue: "300" });
exports.listHeightProperty = new view_1.Property({ name: "listHeight", defaultValue: "300" });
exports.dimmerColorProperty = new view_1.Property({ name: "dimmerColor", defaultValue: "rgba(0,0,0,0.8)" });
exports.blurProperty = new view_1.Property({ name: "blur", defaultValue: "none" });
exports.focusOnShowProperty = new view_1.Property({ name: "focusOnShow", defaultValue: false });
exports.hideFilterProperty = new view_1.Property({ name: "hideFilter", defaultValue: false });
exports.hintTextProperty = new view_1.Property({ name: "hintText", defaultValue: "Enter text to filter..." });
exports.sourceProperty = new view_1.Property({
    name: "source", defaultValue: undefined, affectsLayout: true,
    valueChanged: function (target, oldValue, newValue) {
        if (!filtering) {
            while (unfilteredSource.length) {
                unfilteredSource.pop();
            }
            newValue.forEach(function (element) {
                unfilteredSource.push(element);
            });
        }
    }
});
var FilterableListpicker = (function (_super) {
    __extends(FilterableListpicker, _super);
    function FilterableListpicker() {
        var _this = _super.call(this) || this;
        _this.visibility = enums.Visibility.collapse;
        _this.blurView = false;
        var innerComponent;
        innerComponent = builder.parse("\n            <GridLayout id=\"dc_flp_container\" visibility=\"collapsed\">\n                <StackLayout tap=\"{{cancel}}\" width=\"100%\" height=\"100%\"></StackLayout>\n                <GridLayout width=\"{{listWidth}}\" verticalAlignment=\"middle\" rows=\"40, auto, 40\" id=\"dc_flp\" style=\"border-radius: 10;\">\n                    <TextField hint=\"{{hintText}}\" row=\"0\" text=\"{{filterText}}\" id=\"filterTextField\" style=\"padding: 10 15; height: 40; background-color: #E0E0E0; border-radius: 10 10 0 0;\"></TextField>\n                    <ListView items=\"{{ source }}\" row=\"1\" height=\"{{listHeight}}\" itemTap=\"{{choose}}\" style=\"background-color: white;\">\n                        <ListView.itemTemplate>\n                            <StackLayout>\n                                <GridLayout rows=\"*\" columns=\"*\" visibility=\"{{ name ? 'visible' : 'collapsed' }}\" style=\"margin: 10 10 10 5;\" col=\"1\" verticalAlignment=\"middle\">\n                                    <Label row=\"0\" text=\"{{ name }}\" width=\"100%\" textWrap=\"true\" paddingRight=\"20\" style=\"font-weight: bold; font-size: 16;\"></Label>\n                                    <Image row=\"0\" height=\"20\" src=\"{{ icon }}\" verticalAlignment=\"middle\" horizontalAlignment=\"right\" marginRigth=\"4\" />\n                                </GridLayout>\n                            </StackLayout>\n                        </ListView.itemTemplate>\n                    </ListView>\n                    <StackLayout row=\"2\" height=\"40\" style=\"background-color: #E0E0E0; height: 40; border-radius: 0 0 10 10;\">\n                        <Button text=\"Cancelar\" tap=\"{{cancel}}\" verticalAlignment=\"middle\" style=\"font-weight: bold; height: 40; background-color: transparent; background-color: transparent; border-color: transparent; border-width: 1; font-size: 12;\"></Button>\n                    </StackLayout>\n                </GridLayout>\n            </GridLayout>");
        innerComponent.bindingContext = _this;
        _this.addChild(innerComponent);
        var textfield = innerComponent.getViewById("filterTextField");
        textfield.on("textChange", function (data) {
            filtering = true;
            _this.source = unfilteredSource.filter(function (item) {
                return item.name.toLowerCase().indexOf(data.value.toLowerCase()) !== -1;
            });
            if (_this.source.length === 0) {
                if (data.value) {
                    var tempSource = new Array();
                    tempSource.push({ name: data.value });
                    _this.source = tempSource;
                }
            }
            filtering = false;
        });
        return _this;
    }
    FilterableListpicker.prototype.choose = function (args) {
        var item = this.source[args.index];
        this.hide();
        this.notify({
            eventName: "itemTapped",
            object: this,
            selectedItem: item
        });
    };
    FilterableListpicker.prototype.cancel = function () {
        this.notify({
            eventName: "canceled",
            object: this
        });
        this.hide();
    };
    FilterableListpicker.prototype.hide = function () {
        var _this = this;
        var textField = frame.topmost().getViewById("filterTextField");
        if (textField.dismissSoftInput) {
            textField.dismissSoftInput();
        }
        textField.text = "";
        var container = frame.topmost().getViewById("dc_flp_container");
        var picker = frame.topmost().getViewById("dc_flp");
        if (this.blurView) {
            UIView.animateWithDurationAnimationsCompletion(.3, function () {
                _this.blurView.effect = null;
            }, function () {
                _this.blurView.removeFromSuperview();
            });
        }
        else {
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
        }).then(function () {
            _this.visibility = enums.Visibility.collapse;
            container.visibility = "collapse";
        });
    };
    FilterableListpicker.prototype.show = function () {
        var _this = this;
        var container = frame.topmost().getViewById("dc_flp_container");
        var picker = frame.topmost().getViewById("dc_flp");
        this.visibility = enums.Visibility.visible;
        container.visibility = "visible";
        if (platform_1.isIOS && this.blur && this.blur !== "none") {
            var iosView = container.ios;
            var effectView_1 = UIVisualEffectView.alloc().init();
            effectView_1.frame = CGRectMake(0, 0, iosView.bounds.size.width, iosView.bounds.size.height);
            effectView_1.autoresizingMask = 2 | 16;
            this.blurView = effectView_1;
            iosView.addSubview(effectView_1);
            iosView.sendSubviewToBack(effectView_1);
            UIView.animateWithDurationAnimationsCompletion(.3, function () {
                var theme = 2;
                if (_this.blur === "light") {
                    theme = 1;
                }
                effectView_1.effect = UIBlurEffect.effectWithStyle(theme);
            }, function () {
            });
        }
        else {
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
        var textField = frame.topmost().getViewById("filterTextField");
        if (JSON.parse(this.focusOnShow)) {
            textField.focus();
        }
    };
    FilterableListpicker.canceledEvent = "canceled";
    FilterableListpicker.itemTappedEvent = "itemTapped";
    return FilterableListpicker;
}(grid_layout_1.GridLayout));
exports.FilterableListpicker = FilterableListpicker;
exports.listWidthProperty.register(FilterableListpicker);
exports.listHeightProperty.register(FilterableListpicker);
exports.dimmerColorProperty.register(FilterableListpicker);
exports.focusOnShowProperty.register(FilterableListpicker);
exports.hideFilterProperty.register(FilterableListpicker);
exports.blurProperty.register(FilterableListpicker);
exports.hintTextProperty.register(FilterableListpicker);
exports.sourceProperty.register(FilterableListpicker);
//# sourceMappingURL=filterable-listpicker.js.map