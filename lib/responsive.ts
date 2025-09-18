import { Dimensions, PixelRatio } from 'react-native';

// Base sizes from a standard phone (iPhone X-ish)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

function getScreen() {
  // Get current window each call so rotation is reflected
  const { width, height } = Dimensions.get('window');
  return { width, height };
}

export function scale(size: number) {
  const { width } = getScreen();
  return (width / BASE_WIDTH) * size;
}

export function verticalScale(size: number) {
  const { height } = getScreen();
  return (height / BASE_HEIGHT) * size;
}

export function moderateScale(size: number, factor = 0.5) {
  const scaled = scale(size);
  return size + (scaled - size) * factor;
}

export function roundToNearestPixel(value: number) {
  return PixelRatio.roundToNearestPixel(value);
}

export const s = scale;
export const vs = verticalScale;
export const ms = moderateScale;

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function msc(base: number, min: number, max: number, factor = 0.5) {
  return clamp(moderateScale(base, factor), min, max);
}

export const cl = clamp;
