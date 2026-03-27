import { AppError } from "../utils/AppError.js";

export class MixingMachine {
  constructor({ id, speed, baseDuration, active = false, potId = null, lastOutputPotId = null }) {
    if (!id) {
      throw new AppError("Machine mist een id.", "MACHINE_ID_REQUIRED");
    }

    if (!Number.isFinite(speed) || speed <= 0) {
      throw new AppError("Machine moet een geldige snelheid hebben.", "MACHINE_SPEED_INVALID");
    }

    if (!Number.isFinite(baseDuration) || baseDuration <= 0) {
      throw new AppError("Machine moet een geldige basistijd hebben.", "MACHINE_DURATION_INVALID");
    }

    this.id = id;
    this.speed = speed;
    this.baseDuration = baseDuration;
    this.active = active;
    this.potId = potId;
    this.lastOutputPotId = lastOutputPotId;
  }
}
