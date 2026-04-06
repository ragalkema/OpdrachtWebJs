import { APP_CONFIG } from "../config/appConfig.js";
import { handleAsyncError, withErrorBoundary } from "../utils/errorHandler.js";

export function bindAppControllerEvents(controller) {
  const { state, view } = controller;

  view.bindPageNavigation((page) => {
    state.activePage = page;
    view.setActivePage(page);
  });

  view.bindHallNavigation((hallId) => {
    state.activeHallId = hallId;
    controller.renderHalls();
  });

  view.bindIngredientCreate((formData) => {
    withErrorBoundary(() => controller.createIngredient(formData));
  });

  view.bindRandomIngredient(() => {
    withErrorBoundary(() => controller.createRandomIngredient());
  });

  view.bindIngredientRemoval((ingredientId) => {
    withErrorBoundary(() => controller.removeIngredient(ingredientId));
  });

  view.bindPotCreate(() => {
    withErrorBoundary(() => controller.createPot());
  });

  view.bindMachineCreate((formData) => {
    withErrorBoundary(() => controller.createMachine(formData));
  });

  view.bindMachineRemoval((machineId) => {
    withErrorBoundary(() => controller.removeMachine(machineId));
  });

  view.bindGridGenerate(({ rows, columns }) => {
    withErrorBoundary(() => {
      state.setGrid(rows, columns);
      controller.renderGrid();
      view.showStatus(`Grid van ${columns}x${rows} is aangemaakt.`, "info");
    });
  });

  view.bindGridReset(() => {
    withErrorBoundary(() => {
      state.setGrid(APP_CONFIG.defaultGrid.rows, APP_CONFIG.defaultGrid.columns);
      controller.renderGrid();
      view.showStatus("Het kleurentest grid is gereset.", "info");
    });
  });

  view.bindWeatherSearch((city) => {
    handleAsyncError(() => controller.loadWeather(city), {
      fallbackMessage: "Het weer kon niet worden opgehaald.",
    });
  });

  view.bindDragAndDrop({
    onIngredientDrop: ({ ingredientId, potId }) => {
      withErrorBoundary(() => controller.placeIngredientInPot(ingredientId, potId));
    },
    onPotDrop: ({ potId, machineId }) => {
      withErrorBoundary(() => controller.startMachineRun(machineId, potId));
    },
  });

  view.bindPaletteSelect((paintId) => {
    withErrorBoundary(() => controller.selectPaint(paintId));
  });

  view.bindPotRemoval((potId) => {
    withErrorBoundary(() => controller.removePotContents(potId));
  });

  view.bindPaletteAdvice((paintId) => {
    withErrorBoundary(() => controller.showPaintAdvice(paintId));
  });

  view.bindGridCellClick((cellIndex) => {
    withErrorBoundary(() => controller.paintGridCell(cellIndex));
  });
}
