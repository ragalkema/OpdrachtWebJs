import { AppError } from "../utils/AppError.js";

export class Pot {
  constructor({
    id,
    ingredientIds = [],
    status = "ready",
    mixedPaintId = null,
    assignedMachineId = null,
  }) {
    if (!id) {
      throw new AppError("Pot mist een id.", "POT_ID_REQUIRED");
    }

    this.id = id;
    this.ingredientIds = ingredientIds;
    this.status = status;
    this.mixedPaintId = mixedPaintId;
    this.assignedMachineId = assignedMachineId;
  }
}
