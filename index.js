"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var chroma = require("chroma-js");
var sdk = require("cue-sdk");
var getColors = require("get-image-colors");
var path = require("path");
var filename = "e2dccf779e16f3f7f42bd8c15e418e76.jpg";
var animation = {
    speed: 3,
    direction: "up",
    colorDomainMultiplier: 3,
    ledDomain: 100,
    frameLength: 100,
    saturation: 3
};
var devices = {};
var getColorsFromImage = function (count) {
    if (count === void 0) { count = 7; }
    return __awaiter(void 0, void 0, void 0, function () {
        var options, shaderColors, saturated;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    options = { count: count, type: "image/jpg" };
                    return [4 /*yield*/, getColors(path.join(__dirname, "images/".concat(filename)), options)];
                case 1:
                    shaderColors = _a.sent();
                    shaderColors.push(shaderColors[0]);
                    saturated = shaderColors.map(function (color) {
                        return color.saturate(animation.saturation);
                    });
                    return [2 /*return*/, saturated];
            }
        });
    });
};
var createColorScale = function (chromaColors, leds, device) { return __awaiter(void 0, void 0, void 0, function () {
    var positions, positionsSorted;
    return __generator(this, function (_a) {
        positions = new Set(leds.map(function (led) {
            return animation.direction === "up" || animation.direction === "down"
                ? led.top
                : led.left;
        }));
        positionsSorted = Array.from(positions).sort(function (a, b) { return a - b; });
        devices[device.deviceId].minPosition = positionsSorted[0];
        devices[device.deviceId].maxPosition =
            positionsSorted[positionsSorted.length - 1];
        return [2 /*return*/, chroma
                .scale(chromaColors)
                .domain([0, animation.ledDomain * animation.colorDomainMultiplier])];
    });
}); };
var setDeviceScales = function (device, chromaColors, leds) { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = devices[device.deviceId];
                return [4 /*yield*/, createColorScale(chromaColors, leds, device)];
            case 1:
                _a.chromaScale = _b.sent();
                devices[device.deviceId].scaleOffset = 0;
                return [2 /*return*/, devices[device.deviceId].chromaScale];
        }
    });
}); };
var theThing = function () { return __awaiter(void 0, void 0, void 0, function () {
    var chromaColors, errCode, n_1, _loop_1, deviceIndex;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                sdk.CorsairPerformProtocolHandshake();
                return [4 /*yield*/, getColorsFromImage()];
            case 1:
                chromaColors = _a.sent();
                errCode = sdk.CorsairGetLastError();
                if (!(errCode === 0)) return [3 /*break*/, 6];
                n_1 = sdk.CorsairGetDeviceCount();
                _loop_1 = function (deviceIndex) {
                    var device, leds, chromaScale, ledColors;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                device = sdk.CorsairGetDeviceInfo(deviceIndex);
                                devices[device.deviceId] = {};
                                leds = sdk.CorsairGetLedPositionsByDeviceIndex(deviceIndex);
                                return [4 /*yield*/, setDeviceScales(device, chromaColors, leds)];
                            case 1:
                                chromaScale = _b.sent();
                                ledColors = [];
                                leds.forEach(function (led) {
                                    var positionRaw = animation.direction === "up" || animation.direction === "down"
                                        ? led.top
                                        : led.left;
                                    var positionOffset = (positionRaw / devices[device.deviceId].minPosition) *
                                        animation.ledDomain;
                                    var color = chromaScale(positionOffset).rgb();
                                    ledColors.push({
                                        ledId: led.ledId,
                                        r: color[0],
                                        g: color[1],
                                        b: color[2]
                                    });
                                });
                                sdk.CorsairSetLedsColorsBufferByDeviceIndex(deviceIndex, ledColors);
                                return [2 /*return*/];
                        }
                    });
                };
                deviceIndex = 0;
                _a.label = 2;
            case 2:
                if (!(deviceIndex < n_1)) return [3 /*break*/, 5];
                return [5 /*yield**/, _loop_1(deviceIndex)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                ++deviceIndex;
                return [3 /*break*/, 2];
            case 5:
                sdk.CorsairSetLedsColorsFlushBuffer();
                setInterval(function () {
                    sdk.CorsairSetLedsColorsFlushBuffer();
                    var _loop_2 = function (deviceIndex) {
                        var device = sdk.CorsairGetDeviceInfo(deviceIndex);
                        devices[device.deviceId].scaleOffset += animation.speed;
                        while (devices[device.deviceId].scaleOffset >
                            animation.ledDomain * animation.colorDomainMultiplier) {
                            devices[device.deviceId].scaleOffset -=
                                animation.ledDomain * animation.colorDomainMultiplier;
                        }
                        var leds = sdk.CorsairGetLedPositionsByDeviceIndex(deviceIndex);
                        var ledColors = [];
                        leds.forEach(function (led) {
                            var positionRaw = animation.direction === "up" || animation.direction === "down"
                                ? led.top
                                : led.left;
                            var positionOffset = (positionRaw / devices[device.deviceId].maxPosition) *
                                animation.ledDomain;
                            if (animation.direction === "up" || animation.direction === "left") {
                                positionOffset += devices[device.deviceId].scaleOffset;
                            }
                            else {
                                positionOffset -= devices[device.deviceId].scaleOffset;
                            }
                            while (positionOffset >
                                animation.ledDomain * animation.colorDomainMultiplier) {
                                positionOffset -=
                                    animation.ledDomain * animation.colorDomainMultiplier;
                            }
                            while (positionOffset < 0) {
                                positionOffset +=
                                    animation.ledDomain * animation.colorDomainMultiplier;
                            }
                            var color = devices[device.deviceId]
                                .chromaScale(positionOffset)
                                .rgb();
                            ledColors.push({
                                ledId: led.ledId,
                                r: color[0],
                                g: color[1],
                                b: color[2]
                            });
                        });
                        sdk.CorsairSetLedsColorsBufferByDeviceIndex(deviceIndex, ledColors);
                    };
                    for (var deviceIndex = 0; deviceIndex < n_1; ++deviceIndex) {
                        _loop_2(deviceIndex);
                    }
                }, animation.frameLength);
                return [3 /*break*/, 7];
            case 6:
                console.log(errCode);
                _a.label = 7;
            case 7: return [2 /*return*/];
        }
    });
}); };
theThing();
