import { WEATHER_CONFIG } from "../config/weatherConfig.js";
import { WeatherService } from "../services/WeatherService.js";
import { bindAppControllerEvents } from "./bindAppControllerEvents.js";
import {
  createIngredientAction,
  createRandomIngredientAction,
  placeIngredientInPotAction,
  removeIngredientAction,
} from "./appController/ingredientActions.js";
import {
  createMachineAction,
  createPotAction,
  finishMachineRunAction,
  removeMachineAction,
  removePotContentsAction,
  startMachineRunAction,
} from "./appController/machineActions.js";
import {
  paintGridCellAction,
  selectPaintAction,
  showPaintAdviceAction,
} from "./appController/colorTestActions.js";
import { loadWeatherAction, seedDemoDataAction } from "./appController/weatherActions.js";
import {
  renderAppAction,
  renderGridAction,
  renderHallsAction,
  renderIngredientsAction,
  renderPaletteAction,
  renderPotsAction,
} from "./appController/renderActions.js";

export class AppController {
  constructor(state, view) {
    this.state = state;
    this.view = view;
    this.weatherService = new WeatherService(WEATHER_CONFIG);
    this.mixTimers = new Map();
  }

  async init() {
    seedDemoDataAction(this);
    bindAppControllerEvents(this);
    renderAppAction(this);
    await loadWeatherAction(this, this.state.weather.city);
  }

  createIngredient(formData) {
    return createIngredientAction(this, formData);
  }

  createRandomIngredient() {
    return createRandomIngredientAction(this);
  }

  removeIngredient(ingredientId) {
    return removeIngredientAction(this, ingredientId);
  }

  createPot() {
    return createPotAction(this);
  }

  createMachine(formData) {
    return createMachineAction(this, formData);
  }

  removeMachine(machineId) {
    return removeMachineAction(this, machineId);
  }

  placeIngredientInPot(ingredientId, potId) {
    return placeIngredientInPotAction(this, ingredientId, potId);
  }

  removePotContents(potId) {
    return removePotContentsAction(this, potId);
  }

  startMachineRun(machineId, potId) {
    return startMachineRunAction(this, machineId, potId);
  }

  finishMachineRun(machineId, potId) {
    return finishMachineRunAction(this, machineId, potId);
  }

  selectPaint(paintId) {
    return selectPaintAction(this, paintId);
  }

  showPaintAdvice(paintId) {
    return showPaintAdviceAction(this, paintId);
  }

  paintGridCell(cellIndex) {
    return paintGridCellAction(this, cellIndex);
  }

  loadWeather(city) {
    return loadWeatherAction(this, city);
  }

  render() {
    return renderAppAction(this);
  }

  renderIngredients() {
    return renderIngredientsAction(this);
  }

  renderPots() {
    return renderPotsAction(this);
  }

  renderHalls() {
    return renderHallsAction(this);
  }

  renderPalette() {
    return renderPaletteAction(this);
  }

  renderGrid() {
    return renderGridAction(this);
  }
}
