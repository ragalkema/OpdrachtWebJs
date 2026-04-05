import { Ingredient } from "../../models/Ingredient.js";
import { AppError } from "../../utils/AppError.js";
import { getIngredientsInPot, invalidateMixedPaint } from "../mixingState.js";

export function createIngredientAction(controller, formData) {
  const ingredient = Ingredient.fromFormData(formData);
  controller.state.ingredients.unshift(ingredient);
  controller.renderIngredients();
  controller.view.resetIngredientForm();
  controller.view.showStatus(`Ingredient "${ingredient.name}" is toegevoegd.`, "success");
}

export function createRandomIngredientAction(controller) {
  const ingredient = Ingredient.createRandom();
  controller.state.ingredients.unshift(ingredient);
  controller.renderIngredients();
  controller.view.showStatus(`Willekeurig ingredient "${ingredient.name}" is aangemaakt.`, "info");
}

export function removeIngredientAction(controller, ingredientId) {
  const ingredient = controller.state.getIngredientById(ingredientId);

  if (ingredient.potId) {
    throw new AppError(
      "Je kunt een ingredient niet verwijderen terwijl het in een pot zit.",
      "INGREDIENT_IN_POT"
    );
  }

  controller.state.ingredients = controller.state.ingredients.filter((item) => item.id !== ingredientId);
  controller.renderIngredients();
  controller.view.showStatus(`Ingredient "${ingredient.name}" is verwijderd.`, "info");
}

export function placeIngredientInPotAction(controller, ingredientId, potId) {
  const ingredient = controller.state.getIngredientById(ingredientId);
  const pot = controller.state.getPotById(potId);

  if (ingredient.potId) {
    throw new AppError("Dit ingredient zit al in een pot.", "INGREDIENT_ALREADY_ASSIGNED");
  }

  if (pot.status === "mixing") {
    throw new AppError("Je kunt geen ingredient toevoegen tijdens het mengen.", "POT_BUSY");
  }

  const potIngredients = getIngredientsInPot(controller.state, pot);

  if (potIngredients.length > 0 && potIngredients[0].mixSpeed !== ingredient.mixSpeed) {
    throw new AppError(
      "Alleen ingredienten met dezelfde mengsnelheid mogen samen in een pot.",
      "POT_SPEED_MISMATCH"
    );
  }

  ingredient.potId = pot.id;
  pot.ingredientIds.push(ingredient.id);
  invalidateMixedPaint(controller.state, pot);
  controller.renderIngredients();
  controller.renderPots();
  controller.renderPalette();
  controller.view.showStatus(`"${ingredient.name}" is in een pot geplaatst.`, "success");
}
