import { APP_CONFIG } from "../config/appConfig.js";
import { Ingredient } from "../models/Ingredient.js";
import { MixingMachine } from "../models/MixingMachine.js";
import { Pot } from "../models/Pot.js";
import { averageRgbStrings } from "../utils/colorUtils.js";

export function createDemoStateSnapshot() {
  const ingredients = [
    new Ingredient({
      name: "Citrus Seed",
      mixTime: 1200,
      mixSpeed: 1,
      colorMode: "rgb",
      colorValue: "rgb(163, 220, 69)",
      texture: "glad",
      shape: "triangle",
    }),
    new Ingredient({
      name: "Ocean Dust",
      mixTime: 900,
      mixSpeed: 2,
      colorMode: "rgb",
      colorValue: "rgb(66, 162, 245)",
      texture: "korrel",
      shape: "circle",
    }),
    new Ingredient({
      name: "Amber Base",
      mixTime: 1400,
      mixSpeed: 2,
      colorMode: "rgb",
      colorValue: "rgb(240, 145, 48)",
      texture: "grove-korrel",
      shape: "square",
    }),
    new Ingredient({
      name: "Mango Tone",
      mixTime: 1000,
      mixSpeed: 2,
      colorMode: "rgb",
      colorValue: "rgb(252, 189, 72)",
      texture: "glad",
      shape: "diamond",
    }),
    new Ingredient({
      name: "Rose Drop",
      mixTime: 1100,
      mixSpeed: 1,
      colorMode: "rgb",
      colorValue: "rgb(230, 57, 131)",
      texture: "slijmerig",
      shape: "circle",
    }),
    new Ingredient({
      name: "Mint Soft",
      mixTime: 1300,
      mixSpeed: 1,
      colorMode: "rgb",
      colorValue: "rgb(111, 214, 169)",
      texture: "glad",
      shape: "triangle",
    }),
  ];

  const readyPot = new Pot({ id: crypto.randomUUID() });
  const mixedPot = new Pot({
    id: crypto.randomUUID(),
    status: "mixed",
    mixedPaintId: crypto.randomUUID(),
  });

  ingredients[2].potId = readyPot.id;
  ingredients[3].potId = readyPot.id;
  ingredients[4].potId = mixedPot.id;
  ingredients[5].potId = mixedPot.id;

  readyPot.ingredientIds = [ingredients[2].id, ingredients[3].id];
  mixedPot.ingredientIds = [ingredients[4].id, ingredients[5].id];

  const mixedPaint = {
    id: mixedPot.mixedPaintId,
    name: "Mix pot 2",
    colorValue: averageRgbStrings([ingredients[4].colorValue, ingredients[5].colorValue]),
    sourcePotId: mixedPot.id,
    mixSpeed: 1,
  };

  const halls = APP_CONFIG.halls.map((hall, index) => ({
    ...hall,
    outputPotIds: index === 0 ? [mixedPot.id] : [],
    machines: [
      new MixingMachine({
        id: crypto.randomUUID(),
        speed: index + 1,
        baseDuration: 1000 + index * 300,
      }),
    ],
  }));

  return {
    ingredients,
    pots: [readyPot, mixedPot],
    mixedPaints: [mixedPaint],
    selectedPaintId: mixedPaint.id,
    halls,
  };
}
