import { AppError } from "../utils/AppError.js";
import { getTriadicRgbStrings, parseRgbString, toRgbString } from "../utils/colorUtils.js";

const SHAPES = ["triangle", "square", "circle", "diamond"];
const TEXTURES = ["korrel", "grove-korrel", "glad", "slijmerig"];

export class Ingredient {
  constructor({
    id = crypto.randomUUID(),
    name,
    mixTime,
    mixSpeed,
    colorMode,
    colorValue,
    texture,
    shape = SHAPES[Math.floor(Math.random() * SHAPES.length)],
    potId = null,
  }) {
    if (!name) {
      throw new AppError("Ingrediënt moet een naam hebben.", "INGREDIENT_NAME_REQUIRED");
    }

    if (!Number.isFinite(mixTime) || mixTime <= 0) {
      throw new AppError("Mengtijd moet groter zijn dan 0.", "INGREDIENT_TIME_INVALID");
    }

    if (!Number.isFinite(mixSpeed) || mixSpeed <= 0) {
      throw new AppError("Mengsnelheid moet groter zijn dan 0.", "INGREDIENT_SPEED_INVALID");
    }

    this.id = id;
    this.name = name.trim();
    this.mixTime = mixTime;
    this.mixSpeed = mixSpeed;
    this.colorMode = colorMode;
    this.colorValue = this.normalizeColor(colorMode, colorValue);
    this.texture = texture;
    this.shape = shape;
    this.potId = potId;
  }

  static fromFormData(formData) {
    return new Ingredient({
      name: formData.get("name")?.toString(),
      mixTime: Number(formData.get("mixTime")),
      mixSpeed: Number(formData.get("mixSpeed")),
      colorMode: formData.get("colorMode")?.toString(),
      colorValue: formData.get("colorValue")?.toString(),
      texture: formData.get("texture")?.toString(),
    });
  }

  static createRandom() {
    const names = ["Nova", "Flux", "Glow", "Mist", "Pulse", "Bloom"];

    return new Ingredient({
      name: `${names[Math.floor(Math.random() * names.length)]} ${Math.floor(Math.random() * 99) + 1}`,
      mixTime: (Math.floor(Math.random() * 10) + 1) * 300,
      mixSpeed: Math.floor(Math.random() * 3) + 1,
      colorMode: "rgb",
      colorValue: toRgbString({
        r: Math.floor(Math.random() * 256),
        g: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256),
      }),
      texture: TEXTURES[Math.floor(Math.random() * TEXTURES.length)],
    });
  }

  getTriadicColors() {
    return getTriadicRgbStrings(this.colorValue).map((value, index) => ({
      label: `Advies ${index + 1}`,
      value,
    }));
  }

  normalizeColor(colorMode, value) {
    if (colorMode !== "rgb") {
      throw new AppError("Deze schoolversie gebruikt RGB als kleurformaat.", "COLOR_MODE_INVALID");
    }

    return toRgbString(parseRgbString(value));
  }
}
