import { WEATHER_CONFIG } from "../config/weatherConfig.js";
import { bindAppControllerEvents } from "./bindAppControllerEvents.js";
import { createDemoStateSnapshot } from "./demoStateFactory.js";
import {
  calculateMixDuration,
  createOrUpdateMixedPaint,
  getIngredientsInPot,
  getPotNumber,
  invalidateMixedPaint,
} from "./mixingState.js";
import { Ingredient } from "../models/Ingredient.js";
import { MixingMachine } from "../models/MixingMachine.js";
import { Pot } from "../models/Pot.js";
import { WeatherService } from "../services/WeatherService.js";
import { AppError } from "../utils/AppError.js";
import { getTriadicRgbStrings } from "../utils/colorUtils.js";
import { withErrorBoundary } from "../utils/errorHandler.js";

export class AppController {
  constructor(state, view) {
    this.state = state;
    this.view = view;
    this.weatherService = new WeatherService(WEATHER_CONFIG);
    this.mixTimers = new Map();
  }

  async init() {
    this.seedDemoData();
    bindAppControllerEvents(this);
    this.render();
    await this.loadWeather(this.state.weather.city);
  }

  createIngredient(formData) {
    const ingredient = Ingredient.fromFormData(formData);
    this.state.ingredients.unshift(ingredient);
    this.renderIngredients();
    this.view.resetIngredientForm();
    this.view.showStatus(`Ingredient "${ingredient.name}" is toegevoegd.`, "success");
  }

  createRandomIngredient() {
    const ingredient = Ingredient.createRandom();
    this.state.ingredients.unshift(ingredient);
    this.renderIngredients();
    this.view.showStatus(`Willekeurig ingredient "${ingredient.name}" is aangemaakt.`, "info");
  }

  createPot() {
    const pot = new Pot({ id: crypto.randomUUID() });
    this.state.pots.unshift(pot);
    this.renderPots();
    this.view.showStatus("Lege pot toegevoegd.", "success");
  }

  createMachine(formData) {
    const speed = Number(formData.get("speed"));
    const baseDuration = Number(formData.get("baseDuration"));

    if (!Number.isInteger(speed) || speed < 1 || speed > 5) {
      throw new AppError("Machinesnelheid moet tussen 1 en 5 liggen.", "MACHINE_SPEED_INVALID");
    }

    if (!Number.isFinite(baseDuration) || baseDuration < 100) {
      throw new AppError("Machinetijd moet minimaal 100 ms zijn.", "MACHINE_DURATION_INVALID");
    }

    const hall = this.state.getActiveHall();
    hall.machines.unshift(
      new MixingMachine({
        id: crypto.randomUUID(),
        speed,
        baseDuration,
      })
    );

    this.renderHalls();
    this.view.resetMachineForm();
    this.view.showStatus(`Nieuwe machine toegevoegd in ${hall.name}.`, "success");
  }

  placeIngredientInPot(ingredientId, potId) {
    const ingredient = this.state.getIngredientById(ingredientId);
    const pot = this.state.getPotById(potId);

    if (ingredient.potId) {
      throw new AppError("Dit ingredient zit al in een pot.", "INGREDIENT_ALREADY_ASSIGNED");
    }

    if (pot.status === "mixing") {
      throw new AppError("Je kunt geen ingredient toevoegen tijdens het mengen.", "POT_BUSY");
    }

    const potIngredients = getIngredientsInPot(this.state, pot);

    if (potIngredients.length > 0 && potIngredients[0].mixSpeed !== ingredient.mixSpeed) {
      throw new AppError(
        "Alleen ingredienten met dezelfde mengsnelheid mogen samen in een pot.",
        "POT_SPEED_MISMATCH"
      );
    }

    ingredient.potId = pot.id;
    pot.ingredientIds.push(ingredient.id);
    invalidateMixedPaint(this.state, pot);
    this.renderIngredients();
    this.renderPots();
    this.renderPalette();
    this.view.showStatus(`"${ingredient.name}" is in een pot geplaatst.`, "success");
  }

  removePotContents(potId) {
    const pot = this.state.getPotById(potId);

    if (pot.status === "mixing") {
      throw new AppError("Je kunt een pot niet leeghalen terwijl hij gemengd wordt.", "POT_BUSY");
    }

    if (pot.ingredientIds.length === 0) {
      return;
    }

    const potIngredients = getIngredientsInPot(this.state, pot);

    potIngredients.forEach((ingredient) => {
      ingredient.potId = null;
    });

    pot.ingredientIds = [];
    pot.assignedMachineId = null;
    this.state.halls.forEach((hall) => {
      hall.outputPotIds = hall.outputPotIds.filter((id) => id !== pot.id);
    });

    invalidateMixedPaint(this.state, pot);
    this.renderIngredients();
    this.renderPots();
    this.renderHalls();
    this.renderPalette();
    this.renderGrid();
    this.view.showStatus(`Pot ${getPotNumber(this.state, pot.id)} is weer leeg gemaakt.`, "info");
  }

  startMachineRun(machineId, potId) {
    const machine = this.state.getMachineById(machineId);
    const hall = this.state.getHallByMachineId(machineId);
    const pot = this.state.getPotById(potId);
    const ingredients = getIngredientsInPot(this.state, pot);

    if (machine.active) {
      throw new AppError("Deze machine is al bezig.", "MACHINE_ALREADY_ACTIVE");
    }

    if (pot.status === "mixing") {
      throw new AppError("Deze pot wordt al gemengd.", "POT_ALREADY_MIXING");
    }

    if (pot.status === "mixed") {
      throw new AppError(
        "Deze pot is al gemengd. Voeg eerst een nieuw ingredient toe als je opnieuw wilt mengen.",
        "POT_ALREADY_MIXED"
      );
    }

    if (ingredients.length === 0) {
      throw new AppError("Een lege pot kan niet gemengd worden.", "POT_EMPTY");
    }

    if (machine.speed !== ingredients[0].mixSpeed) {
      throw new AppError(
        "De machinesnelheid moet gelijk zijn aan de mengsnelheid van de pot.",
        "MACHINE_SPEED_MISMATCH"
      );
    }

    if (this.state.weather.temperature > 35 && this.state.getActiveMachineCount() >= 1) {
      throw new AppError(
        "Boven 35 graden mag er maximaal 1 machine tegelijk draaien.",
        "WEATHER_MACHINE_LIMIT"
      );
    }

    const duration = calculateMixDuration(ingredients, machine, this.state.weather);

    pot.status = "mixing";
    pot.assignedMachineId = machine.id;
    machine.active = true;
    machine.potId = pot.id;
    machine.currentDuration = duration;
    hall.outputPotIds = hall.outputPotIds.filter((id) => id !== pot.id);

    this.renderPots();
    this.renderHalls();
    this.view.showStatus(
      `Machine gestart voor pot ${getPotNumber(this.state, pot.id)}. Mengtijd: ${duration} ms.`,
      "info"
    );

    const timerId = setTimeout(() => {
      withErrorBoundary(() => this.finishMachineRun(machine.id, pot.id), this.view);
    }, duration);

    this.mixTimers.set(machine.id, timerId);
  }

  finishMachineRun(machineId, potId) {
    const machine = this.state.getMachineById(machineId);
    const hall = this.state.getHallByMachineId(machineId);
    const pot = this.state.getPotById(potId);
    const paint = createOrUpdateMixedPaint(this.state, pot);

    pot.status = "mixed";
    pot.assignedMachineId = null;
    pot.mixedPaintId = paint.id;
    machine.active = false;
    machine.potId = null;
    machine.lastOutputPotId = pot.id;
    machine.currentDuration = 0;

    hall.outputPotIds = [pot.id, ...hall.outputPotIds.filter((id) => id !== pot.id)].slice(0, 5);
    this.mixTimers.delete(machine.id);

    if (!this.state.selectedPaintId) {
      this.state.selectedPaintId = paint.id;
    }

    this.renderPots();
    this.renderHalls();
    this.renderPalette();
    this.renderGrid();
    this.view.showStatus(
      `Pot ${getPotNumber(this.state, pot.id)} is klaar en beschikbaar als "${paint.name}".`,
      "success"
    );
  }

  selectPaint(paintId) {
    const paint = this.state.getPaintById(paintId);
    this.state.selectedPaintId = paint.id;
    this.renderPalette();
    this.view.showStatus(`"${paint.name}" is geselecteerd voor het grid.`, "info");
  }

  showPaintAdvice(paintId) {
    const paint = this.state.getPaintById(paintId);
    const triadicColors = getTriadicRgbStrings(paint.colorValue).map((value, index) => ({
      label: `Advies ${index + 1}`,
      value,
    }));

    this.view.showTriadicColors(paint, triadicColors);
  }

  paintGridCell(cellIndex) {
    if (!this.state.selectedPaintId) {
      throw new AppError("Selecteer eerst een gemengde verf.", "PAINT_NOT_SELECTED");
    }

    this.state.getPaintById(this.state.selectedPaintId);
    this.state.paintCell(cellIndex, this.state.selectedPaintId);
    this.renderGrid();
  }

  async loadWeather(city) {
    const weather = await this.weatherService.getWeatherByCity(city);
    this.state.weather = weather;
    this.view.renderWeather(weather);
    this.renderHalls();

    if (weather.temperature > 35 && this.state.getActiveMachineCount() > 1) {
      this.view.showStatus(
        "Waarschuwing: boven 35 graden mag er maar 1 machine tegelijk draaien.",
        "warning"
      );
      return;
    }

    this.view.showStatus(`Weer geladen voor ${weather.city}.`, "success");
  }

  seedDemoData() {
    Object.assign(this.state, createDemoStateSnapshot());
  }

  render() {
    this.view.setActivePage(this.state.activePage);
    this.view.renderWeather(this.state.weather);
    this.renderIngredients();
    this.renderPots();
    this.renderHalls();
    this.renderPalette();
    this.renderGrid();
  }

  renderIngredients() {
    const availableIngredients = this.state.ingredients.filter((ingredient) => !ingredient.potId);
    this.view.renderIngredients(availableIngredients);
  }

  renderPots() {
    this.view.renderPots(this.state.pots, this.state.ingredients, this.state.mixedPaints);
  }

  renderHalls() {
    this.view.renderHalls(
      this.state.halls,
      this.state.activeHallId,
      this.state.pots,
      this.state.ingredients,
      this.state.mixedPaints,
      this.state.weather
    );
  }

  renderPalette() {
    this.view.renderPalette(this.state.mixedPaints, this.state.selectedPaintId);
    const selectedPaint = this.state.selectedPaintId
      ? this.state.getPaintById(this.state.selectedPaintId)
      : null;
    this.view.renderSelectedPaint(selectedPaint);
  }

  renderGrid() {
    this.view.renderGrid(this.state.grid, this.state.mixedPaints);
  }
}
