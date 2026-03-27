import { APP_CONFIG } from "../config/appConfig.js";
import { AppError } from "../utils/AppError.js";

export class AppState {
  constructor() {
    this.activePage = "simulator";
    this.activeHallId = APP_CONFIG.halls[0].id;
    this.ingredients = [];
    this.pots = [];
    this.mixedPaints = [];
    this.halls = APP_CONFIG.halls.map((hall) => ({ ...hall, machines: [] }));
    this.grid = {
      rows: APP_CONFIG.defaultGrid.rows,
      columns: APP_CONFIG.defaultGrid.columns,
      cells: this.createEmptyCells(
        APP_CONFIG.defaultGrid.rows * APP_CONFIG.defaultGrid.columns
      ),
    };
    this.selectedPaintId = null;
    this.weather = {
      city: "Amsterdam",
      condition: "Onbekend",
      temperature: 0,
      mixMultiplier: 1,
    };
  }

  getActiveHall() {
    const hall = this.halls.find((item) => item.id === this.activeHallId);

    if (!hall) {
      throw new AppError("De actieve menghal kon niet worden gevonden.", "HALL_NOT_FOUND");
    }

    return hall;
  }

  setGrid(rows, columns) {
    if (!Number.isInteger(rows) || !Number.isInteger(columns)) {
      throw new AppError("Gridwaarden moeten hele getallen zijn.", "GRID_INVALID");
    }

    if (rows < 1 || columns < 1 || rows > APP_CONFIG.maxGridSize || columns > APP_CONFIG.maxGridSize) {
      throw new AppError(
        `Grid moet tussen 1 en ${APP_CONFIG.maxGridSize} blijven.`,
        "GRID_OUT_OF_RANGE"
      );
    }

    this.grid = {
      rows,
      columns,
      cells: this.createEmptyCells(rows * columns),
    };
  }

  paintCell(index, paintId) {
    if (!this.grid.cells[index] && this.grid.cells[index] !== null) {
      throw new AppError("Gridvak kon niet worden gevonden.", "GRID_CELL_NOT_FOUND");
    }

    this.grid.cells[index] = paintId;
  }

  createEmptyCells(length) {
    return Array.from({ length }, () => null);
  }

  getIngredientById(id) {
    const ingredient = this.ingredients.find((item) => item.id === id);

    if (!ingredient) {
      throw new AppError("Ingrediënt kon niet worden gevonden.", "INGREDIENT_NOT_FOUND");
    }

    return ingredient;
  }

  getPotById(id) {
    const pot = this.pots.find((item) => item.id === id);

    if (!pot) {
      throw new AppError("Pot kon niet worden gevonden.", "POT_NOT_FOUND");
    }

    return pot;
  }

  getMachineById(id) {
    for (const hall of this.halls) {
      const machine = hall.machines.find((item) => item.id === id);

      if (machine) {
        return machine;
      }
    }

    throw new AppError("Machine kon niet worden gevonden.", "MACHINE_NOT_FOUND");
  }

  getHallByMachineId(machineId) {
    const hall = this.halls.find((item) =>
      item.machines.some((machine) => machine.id === machineId)
    );

    if (!hall) {
      throw new AppError("De machine heeft geen geldige hal.", "HALL_FOR_MACHINE_NOT_FOUND");
    }

    return hall;
  }

  getPaintById(id) {
    const paint = this.mixedPaints.find((item) => item.id === id);

    if (!paint) {
      throw new AppError("Gemengde verf kon niet worden gevonden.", "PAINT_NOT_FOUND");
    }

    return paint;
  }

  getActiveMachineCount() {
    return this.halls.reduce(
      (count, hall) => count + hall.machines.filter((machine) => machine.active).length,
      0
    );
  }
}
