import { AppError } from "./AppError.js";

export function parseRgbString(value) {
  const text = value?.trim() ?? "";
  const match = text.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
  const rawValues = match ? match.slice(1) : text.split(",").map((part) => part.trim());

  if (rawValues.length !== 3) {
    throw new AppError("Gebruik een RGB kleur zoals rgb(120, 200, 80).", "RGB_INVALID");
  }

  const [r, g, b] = rawValues.map((item) => Number(item));

  if ([r, g, b].some((item) => !Number.isInteger(item) || item < 0 || item > 255)) {
    throw new AppError("RGB waardes moeten tussen 0 en 255 liggen.", "RGB_RANGE_INVALID");
  }

  return { r, g, b };
}

export function toRgbString({ r, g, b }) {
  return `rgb(${r}, ${g}, ${b})`;
}

export function averageRgbStrings(values) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new AppError("Er zijn geen kleuren om te mengen.", "COLOR_LIST_EMPTY");
  }

  const total = values
    .map(parseRgbString)
    .reduce(
      (sum, color) => ({
        r: sum.r + color.r,
        g: sum.g + color.g,
        b: sum.b + color.b,
      }),
      { r: 0, g: 0, b: 0 }
    );

  return toRgbString({
    r: Math.round(total.r / values.length),
    g: Math.round(total.g / values.length),
    b: Math.round(total.b / values.length),
  });
}

export function getTriadicRgbStrings(value) {
  const rgb = parseRgbString(value);
  const hsl = rgbToHsl(rgb);

  return [120, 240].map((shift) =>
    toRgbString(hslToRgb({ ...hsl, h: (hsl.h + shift) % 360 }))
  );
}

function rgbToHsl({ r, g, b }) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) {
    return { h: 0, s: 0, l: Number((lightness * 100).toFixed(2)) };
  }

  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let hue = 0;

  if (max === red) {
    hue = (green - blue) / delta + (green < blue ? 6 : 0);
  } else if (max === green) {
    hue = (blue - red) / delta + 2;
  } else {
    hue = (red - green) / delta + 4;
  }

  return {
    h: Math.round(hue * 60),
    s: Number((saturation * 100).toFixed(2)),
    l: Number((lightness * 100).toFixed(2)),
  };
}

function hslToRgb({ h, s, l }) {
  const hue = h / 360;
  const saturation = s / 100;
  const lightness = l / 100;

  if (saturation === 0) {
    const gray = Math.round(lightness * 255);
    return { r: gray, g: gray, b: gray };
  }

  const q =
    lightness < 0.5
      ? lightness * (1 + saturation)
      : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;

  return {
    r: Math.round(channelFromHue(p, q, hue + 1 / 3) * 255),
    g: Math.round(channelFromHue(p, q, hue) * 255),
    b: Math.round(channelFromHue(p, q, hue - 1 / 3) * 255),
  };
}

function channelFromHue(p, q, t) {
  let channel = t;

  if (channel < 0) {
    channel += 1;
  }

  if (channel > 1) {
    channel -= 1;
  }

  if (channel < 1 / 6) {
    return p + (q - p) * 6 * channel;
  }

  if (channel < 1 / 2) {
    return q;
  }

  if (channel < 2 / 3) {
    return p + (q - p) * (2 / 3 - channel) * 6;
  }

  return p;
}
