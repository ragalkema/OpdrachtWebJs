import { APP_CONFIG } from "../config/appConfig.js";
import { WEATHER_CONFIG } from "../config/weatherConfig.js";
import { Ingredient } from "../models/Ingredient.js";
import { MixingMachine } from "../models/MixingMachine.js";
import { Pot } from "../models/Pot.js";
import { WeatherService } from "../services/WeatherService.js";
import { AppError } from "../utils/AppError.js";
import {
  averageRgbStrings,
  getTriadicRgbStrings,
} from "../utils/colorUtils.js";
import { handleAsyncError, withErrorBoundary } from "../utils/errorHandler.js";

export class AppController {
  constructor(state, view) {
    this.state = state;
    this.view = view;
    this.weatherService = new WeatherService(WEATHER_CONFIG);
    this.mixTimers = new Map();
  }

  async init() {
    this.seedDemoData();
    this.bindEvents();
    this.render();
    await this.loadWeather(this.state.weather.city);
  }

  bindEvents() {
    this.view.bindPageNavigation((page) => {
      this.state.activePage = page;
      this.view.setActivePage(page);
    });

    this.view.bindHallNavigation((hallId) => {
      this.state.activeHallId = hallId;
      this.renderHalls();
    });

    this.view.bindIngredientCreate((formData) => {
      withErrorBoundary(() => this.createIngredient(formData), this.view);
    });

    this.view.bindRandomIngredient(() => {
      withErrorBoundary(() => this.createRandomIngredient(), this.view);
    });

    this.view.bindPotCreate(() => {
      withErrorBoundary(() => this.createPot(), this.view);
    });

    this.view.bindMachineCreate((formData) => {
      withErrorBoundary(() => this.createMachine(formData), this.view);
    });

    this.view.bindGridGenerate(({ rows, columns }) => {
      withErrorBoundary(() => {
        this.state.setGrid(rows, columns);
        this.renderGrid();
        this.view.showStatus(`Grid van ${columns}x${rows} is aangemaakt.`, "info");
      }, this.view);
    });

    this.view.bindGridReset(() => {
      withErrorBoundary(() => {
        this.state.setGrid(APP_CONFIG.defaultGrid.rows, APP_CONFIG.defaultGrid.columns);
        this.renderGrid();
        this.view.showStatus("Het kleurentest grid is gereset.", "info");
      }, this.view);
    });

    this.view.bindWeatherSearch((city) => {
      handleAsyncError(() => this.loadWeather(city), {
        fallbackMessage: "Het weer kon niet worden opgehaald.",
        onError: (error) => this.view.showStatus(error.message, "error"),
      });
    });

    this.view.bindDragAndDrop({
      onIngredientDrop: ({ ingredientId, potId }) => {
        withErrorBoundary(() => this.placeIngredientInPot(ingredientId, potId), this.view);
      },
      onPotDrop: ({ potId, machineId }) => {
        withErrorBoundary(() => this.startMachineRun(machineId, potId), this.view);
      },
    });

    this.view.bindPaletteSelect((paintId) => {
      withErrorBoundary(() => this.selectPaint(paintId), this.view);
    });

    this.view.bindPaletteAdvice((paintId) => {
      withErrorBoundary(() => this.showPaintAdvice(paintId), this.view);
    });

    this.view.bindGridCellClick((cellIndex) => {
      withErrorBoundary(() => this.paintGridCell(cellIndex), this.view);
    });
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

    const potIngredients = this.getIngredientsInPot(pot);

    if (potIngredients.length > 0 && potIngredients[0].mixSpeed !== ingredient.mixSpeed) {
      throw new AppError(
        "Alleen ingredienten met dezelfde mengsnelheid mogen samen in een pot.",
        "POT_SPEED_MISMATCH"
      );
    }

    ingredient.potId = pot.id;
    pot.ingredientIds.push(ingredient.id);
    this.invalidateMixedPaint(pot);
    this.renderIngredients();
    this.renderPots();
    this.renderPalette();
    this.view.showStatus(`"${ingredient.name}" is in een pot geplaatst.`, "success");
  }

  startMachineRun(machineId, potId) {
    const machine = this.state.getMachineById(machineId);
    const hall = this.state.getHallByMachineId(machineId);
    const pot = this.state.getPotById(potId);
    const ingredients = this.getIngredientsInPot(pot);

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

    const duration = this.calculateMixDuration(ingredients, machine);

    pot.status = "mixing";
    pot.assignedMachineId = machine.id;
    machine.active = true;
    machine.potId = pot.id;
    machine.currentDuration = duration;
    hall.outputPotIds = hall.outputPotIds.filter((id) => id !== pot.id);

    this.renderPots();
    this.renderHalls();
    this.view.showStatus(
      `Machine gestart voor pot ${this.getPotNumber(pot.id)}. Mengtijd: ${duration} ms.`,
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
    const paint = this.createOrUpdateMixedPaint(pot);

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
      `Pot ${this.getPotNumber(pot.id)} is klaar en beschikbaar als "${paint.name}".`,
      "success"
    );
  }

  createOrUpdateMixedPaint(pot) {
    const ingredients = this.getIngredientsInPot(pot);
    const paintId = pot.mixedPaintId ?? crypto.randomUUID();
    const paint = {
      id: paintId,
      name: `Mix pot ${this.getPotNumber(pot.id)}`,
      colorValue: averageRgbStrings(ingredients.map((ingredient) => ingredient.colorValue)),
      sourcePotId: pot.id,
      mixSpeed: ingredients[0].mixSpeed,
    };
    const existingIndex = this.state.mixedPaints.findIndex((item) => item.id === paint.id);

    if (existingIndex >= 0) {
      this.state.mixedPaints.splice(existingIndex, 1, paint);
    } else {
      this.state.mixedPaints.unshift(paint);
    }

    return paint;
  }

  invalidateMixedPaint(pot) {
    if (!pot.mixedPaintId) {
      pot.status = "ready";
      return;
    }

    this.state.mixedPaints = this.state.mixedPaints.filter((item) => item.id !== pot.mixedPaintId);

    if (this.state.selectedPaintId === pot.mixedPaintId) {
      this.state.selectedPaintId = null;
    }

    pot.mixedPaintId = null;
    pot.status = "ready";
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
      name: `Mix pot 2`,
      colorValue: averageRgbStrings([ingredients[4].colorValue, ingredients[5].colorValue]),
      sourcePotId: mixedPot.id,
      mixSpeed: 1,
    };

    this.state.ingredients = ingredients;
    this.state.pots = [readyPot, mixedPot];
    this.state.mixedPaints = [mixedPaint];
    this.state.selectedPaintId = mixedPaint.id;
    this.state.halls = APP_CONFIG.halls.map((hall, index) => ({
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
  }

  getIngredientsInPot(pot) {
    return pot.ingredientIds.map((id) => this.state.getIngredientById(id));
  }

  getPotNumber(potId) {
    return this.state.pots.findIndex((pot) => pot.id === potId) + 1;
  }

  calculateMixDuration(ingredients, machine) {
    const highestIngredientTime = Math.max(
      ...ingredients.map((ingredient) => ingredient.mixTime)
    );

    return Math.round(
      Math.max(highestIngredientTime, machine.baseDuration) * this.state.weather.mixMultiplier
    );
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
