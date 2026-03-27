import { averageRgbStrings } from "../utils/colorUtils.js";

export function getIngredientsInPot(state, pot) {
  return pot.ingredientIds.map((id) => state.getIngredientById(id));
}

export function getPotNumber(state, potId) {
  return state.pots.findIndex((pot) => pot.id === potId) + 1;
}

export function createOrUpdateMixedPaint(state, pot) {
  const ingredients = getIngredientsInPot(state, pot);
  const paintId = pot.mixedPaintId ?? crypto.randomUUID();
  const paint = {
    id: paintId,
    name: `Mix pot ${getPotNumber(state, pot.id)}`,
    colorValue: averageRgbStrings(ingredients.map((ingredient) => ingredient.colorValue)),
    sourcePotId: pot.id,
    mixSpeed: ingredients[0].mixSpeed,
  };
  const existingIndex = state.mixedPaints.findIndex((item) => item.id === paint.id);

  if (existingIndex >= 0) {
    state.mixedPaints.splice(existingIndex, 1, paint);
  } else {
    state.mixedPaints.unshift(paint);
  }

  return paint;
}

export function invalidateMixedPaint(state, pot) {
  if (!pot.mixedPaintId) {
    pot.status = "ready";
    return;
  }

  state.mixedPaints = state.mixedPaints.filter((item) => item.id !== pot.mixedPaintId);

  if (state.selectedPaintId === pot.mixedPaintId) {
    state.selectedPaintId = null;
  }

  pot.mixedPaintId = null;
  pot.status = "ready";
}

export function calculateMixDuration(ingredients, machine, weather) {
  const highestIngredientTime = Math.max(...ingredients.map((ingredient) => ingredient.mixTime));

  return Math.round(Math.max(highestIngredientTime, machine.baseDuration) * weather.mixMultiplier);
}
