import {
  bindGridGenerate,
  bindGridReset,
  bindHallNavigation,
  bindIngredientCreate,
  bindMachineCreate,
  bindPageNavigation,
  bindPotCreate,
  bindRandomIngredient,
  bindWeatherSearch,
} from "./bindings/coreBindings.js";
import {
  bindDragAndDrop,
  bindGridCellClick,
  bindPaletteAdvice,
  bindPaletteSelect,
} from "./bindings/interactionBindings.js";
import {
  renderGrid,
  renderPalette,
  renderSelectedPaint,
  showTriadicColors,
} from "./renderers/colorTestRenderer.js";
import {
  renderHalls,
  renderIngredients,
  renderPots,
  renderWeather,
  setActivePage,
} from "./renderers/simulatorRenderer.js";
import { createViewElements } from "./viewElements.js";
import { showError, showStatus } from "./viewLogger.js";

export class AppView {
  constructor(documentRef) {
    this.document = documentRef;
    this.elements = createViewElements(documentRef);
  }

  bindPageNavigation(handler) {
    bindPageNavigation(this.elements, handler);
  }

  bindHallNavigation(handler) {
    bindHallNavigation(this.elements, handler);
  }

  bindIngredientCreate(handler) {
    bindIngredientCreate(this.elements, handler);
  }

  bindRandomIngredient(handler) {
    bindRandomIngredient(this.elements, handler);
  }

  bindPotCreate(handler) {
    bindPotCreate(this.elements, handler);
  }

  bindMachineCreate(handler) {
    bindMachineCreate(this.elements, handler);
  }

  bindWeatherSearch(handler) {
    bindWeatherSearch(this.elements, handler);
  }

  bindGridGenerate(handler) {
    bindGridGenerate(this.elements, handler);
  }

  bindGridReset(handler) {
    bindGridReset(this.elements, handler);
  }

  bindDragAndDrop(handlers) {
    bindDragAndDrop(this.document, this.elements, handlers);
  }

  bindPaletteSelect(handler) {
    bindPaletteSelect(this.elements, handler);
  }

  bindPaletteAdvice(handler) {
    bindPaletteAdvice(this.elements, handler);
  }

  bindGridCellClick(handler) {
    bindGridCellClick(this.elements, handler);
  }

  setActivePage(page) {
    setActivePage(this.elements, page);
  }

  renderIngredients(ingredients) {
    renderIngredients(this.elements, ingredients);
  }

  renderPots(pots, ingredients, mixedPaints) {
    renderPots(this.elements, pots, ingredients, mixedPaints);
  }

  renderHalls(halls, activeHallId, pots, ingredients, mixedPaints, weather) {
    renderHalls(this.elements, halls, activeHallId, pots, ingredients, mixedPaints, weather);
  }

  renderPalette(items, selectedPaintId) {
    renderPalette(this.elements, items, selectedPaintId);
  }

  renderSelectedPaint(paint) {
    renderSelectedPaint(this.elements, paint);
  }

  renderWeather(weather) {
    renderWeather(this.elements, weather);
  }

  renderGrid(grid, mixedPaints) {
    renderGrid(this.elements, grid, mixedPaints);
  }

  showStatus(message, tone = "info") {
    showStatus(message, tone);
  }

  showError(error) {
    showError(error);
  }

  showTriadicColors(basePaint, triadicColors) {
    showTriadicColors(this.elements, basePaint, triadicColors);
  }

  resetIngredientForm() {
    this.elements.ingredientForm.reset();
  }

  resetMachineForm() {
    this.elements.machineForm.reset();
  }
}
