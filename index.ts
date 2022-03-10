import * as chroma from "chroma-js";
import * as sdk from "cue-sdk";
import * as getColors from "get-image-colors";
import * as path from "path";

const filename = "e2dccf779e16f3f7f42bd8c15e418e76.jpg"
const animation: {
  speed: number;
  direction: "up" | "down" | "left" | "right";
  colorDomainMultiplier: number;
  ledDomain: number;
  frameLength: number; // milliseconds
  saturation: 0 | 1 | 2 | 3;
} = {
  speed: 3,
  direction: "up",
  colorDomainMultiplier: 3,
  ledDomain: 100,
  frameLength: 100,
  saturation: 3,
};

const devices: {
  [deviceId: string]: {
    chromaScale?: chroma.Scale<chroma.Color>;
    scaleOffset?: number;
    minPosition?: number;
    maxPosition?: number;
  };
} = {};

const getColorsFromImage = async (count = 7): Promise<chroma.Color[]> => {
  const options: getColors.Options = { count, type: "image/jpg" };
  const shaderColors = await getColors(
    path.join(__dirname, `images/${filename}`),
    options
  );
  shaderColors.push(shaderColors[0]);
  const saturated = shaderColors.map((color) =>
    color.saturate(animation.saturation)
  );

  return saturated;
};

const createColorScale = async (
  chromaColors: chroma.Color[],
  leds: sdk.CorsairLed[],
  device: sdk.CorsairDeviceInfo
) => {
  const positions = new Set(
    leds.map((led) =>
      animation.direction === "up" || animation.direction === "down"
        ? led.top
        : led.left
    )
  );
  const positionsSorted = Array.from(positions).sort((a, b) => a - b);

  devices[device.deviceId].minPosition = positionsSorted[0];
  devices[device.deviceId].maxPosition =
    positionsSorted[positionsSorted.length - 1];

  return chroma
    .scale(chromaColors)
    .domain([0, animation.ledDomain * animation.colorDomainMultiplier]);
};

const setDeviceScales = async (
  device: sdk.CorsairDeviceInfo,
  chromaColors: chroma.Color[],
  leds: sdk.CorsairLed[]
): Promise<chroma.Scale<chroma.Color>> => {
  devices[device.deviceId].chromaScale = await createColorScale(
    chromaColors,
    leds,
    device
  );
  devices[device.deviceId].scaleOffset = 0;
  return devices[device.deviceId].chromaScale;
};

const theThing = async () => {
  sdk.CorsairPerformProtocolHandshake();

  const chromaColors = await getColorsFromImage();

  const errCode = sdk.CorsairGetLastError();

  if (errCode === 0) {
    const n = sdk.CorsairGetDeviceCount();
    for (let deviceIndex = 0; deviceIndex < n; ++deviceIndex) {
      const device = sdk.CorsairGetDeviceInfo(deviceIndex);
      devices[device.deviceId] = {};
      const leds = sdk.CorsairGetLedPositionsByDeviceIndex(deviceIndex);
      const chromaScale = await setDeviceScales(device, chromaColors, leds);
      const ledColors: Array<sdk.CorsairLedColor> = [];
      leds.forEach((led) => {
        const positionRaw =
          animation.direction === "up" || animation.direction === "down"
            ? led.top
            : led.left;
        const positionOffset =
          (positionRaw / devices[device.deviceId].minPosition) *
          animation.ledDomain;
        const color = chromaScale(positionOffset).rgb();
        ledColors.push({
          ledId: led.ledId,
          r: color[0],
          g: color[1],
          b: color[2],
        });
      });
      sdk.CorsairSetLedsColorsBufferByDeviceIndex(deviceIndex, ledColors);
    }
    sdk.CorsairSetLedsColorsFlushBuffer();

    setInterval(() => {
      sdk.CorsairSetLedsColorsFlushBuffer();
      for (let deviceIndex = 0; deviceIndex < n; ++deviceIndex) {
        const device = sdk.CorsairGetDeviceInfo(deviceIndex);
        devices[device.deviceId].scaleOffset += animation.speed;
        while (
          devices[device.deviceId].scaleOffset >
          animation.ledDomain * animation.colorDomainMultiplier
        ) {
          devices[device.deviceId].scaleOffset -=
            animation.ledDomain * animation.colorDomainMultiplier;
        }
        const leds = sdk.CorsairGetLedPositionsByDeviceIndex(deviceIndex);

        const ledColors: Array<sdk.CorsairLedColor> = [];
        leds.forEach((led) => {
          const positionRaw =
            animation.direction === "up" || animation.direction === "down"
              ? led.top
              : led.left;
          let positionOffset =
            (positionRaw / devices[device.deviceId].maxPosition) *
            animation.ledDomain;
          if (animation.direction === "up" || animation.direction === "left") {
            positionOffset += devices[device.deviceId].scaleOffset;
          } else {
            positionOffset -= devices[device.deviceId].scaleOffset;
          }
          while (
            positionOffset >
            animation.ledDomain * animation.colorDomainMultiplier
          ) {
            positionOffset -=
              animation.ledDomain * animation.colorDomainMultiplier;
          }
          while (positionOffset < 0) {
            positionOffset +=
              animation.ledDomain * animation.colorDomainMultiplier;
          }
          const color = devices[device.deviceId]
            .chromaScale(positionOffset)
            .rgb();
          ledColors.push({
            ledId: led.ledId,
            r: color[0],
            g: color[1],
            b: color[2],
          });
        });
        sdk.CorsairSetLedsColorsBufferByDeviceIndex(deviceIndex, ledColors);
      }
    }, animation.frameLength);
  } else {
    console.log(errCode);
  }
};

theThing();
