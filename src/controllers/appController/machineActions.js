import { MixingMachine } from "../../models/MixingMachine.js";
import { Pot } from "../../models/Pot.js";
import { AppError } from "../../utils/AppError.js";
import { withErrorBoundary } from "../../utils/errorHandler.js";
import {
  calculateMixDuration,
  createOrUpdateMixedPaint,
  getIngredientsInPot,
  getPotNumber,
  invalidateMixedPaint,
} from "../mixingState.js";

export function createPotAction(controller) {
  const pot = new Pot({ id: crypto.randomUUID() });
  controller.state.pots.unshift(pot);
  controller.renderPots();
  controller.view.showStatus("Lege pot toegevoegd.", "success");
}

export function createMachineAction(controller, formData) {
  const speed = Number(formData.get("speed"));
  const baseDuration = Number(formData.get("baseDuration"));

  if (!Number.isInteger(speed) || speed < 1 || speed > 5) {
    throw new AppError("Machinesnelheid moet tussen 1 en 5 liggen.", "MACHINE_SPEED_INVALID");
  }

  if (!Number.isFinite(baseDuration) || baseDuration < 100) {
    throw new AppError("Machinetijd moet minimaal 100 ms zijn.", "MACHINE_DURATION_INVALID");
  }

  const hall = controller.state.getActiveHall();

  if (hall.machines.length >= 4) {
    throw new AppError("Per hal mogen maximaal 4 machines staan.", "MACHINE_LIMIT_REACHED");
  }

  hall.machines.unshift(
    new MixingMachine({
      id: crypto.randomUUID(),
      speed,
      baseDuration,
    })
  );

  controller.renderHalls();
  controller.view.resetMachineForm();
  controller.view.showStatus(`Nieuwe machine toegevoegd in ${hall.name}.`, "success");
}

export function removeMachineAction(controller, machineId) {
  const machine = controller.state.getMachineById(machineId);

  if (machine.active) {
    throw new AppError("Je kunt een actieve machine niet verwijderen.", "MACHINE_ACTIVE_REMOVE");
  }

  const hall = controller.state.getHallByMachineId(machineId);
  hall.machines = hall.machines.filter((item) => item.id !== machineId);
  controller.mixTimers.delete(machineId);
  controller.renderHalls();
  controller.view.showStatus(`Machine verwijderd uit ${hall.name}.`, "info");
}

export function removePotContentsAction(controller, potId) {
  const pot = controller.state.getPotById(potId);

  if (pot.status === "mixing") {
    throw new AppError("Je kunt een pot niet leeghalen terwijl hij gemengd wordt.", "POT_BUSY");
  }

  if (pot.ingredientIds.length === 0) {
    return;
  }

  const potIngredients = getIngredientsInPot(controller.state, pot);

  potIngredients.forEach((ingredient) => {
    ingredient.potId = null;
  });

  pot.ingredientIds = [];
  pot.assignedMachineId = null;
  controller.state.halls.forEach((hall) => {
    hall.outputPotIds = (hall.outputPotIds ?? []).filter((id) => id !== pot.id);
  });

  invalidateMixedPaint(controller.state, pot);
  controller.renderIngredients();
  controller.renderPots();
  controller.renderHalls();
  controller.renderPalette();
  controller.renderGrid();
  controller.view.showStatus(
    `Pot ${getPotNumber(controller.state, pot.id)} is weer leeg gemaakt.`,
    "info"
  );
}

export function startMachineRunAction(controller, machineId, potId) {
  const machine = controller.state.getMachineById(machineId);
  const hall = controller.state.getHallByMachineId(machineId);
  const pot = controller.state.getPotById(potId);
  const ingredients = getIngredientsInPot(controller.state, pot);

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

  if (controller.state.weather.temperature > 35 && controller.state.getActiveMachineCount() >= 1) {
    throw new AppError(
      "Boven 35 graden mag er maximaal 1 machine tegelijk draaien.",
      "WEATHER_MACHINE_LIMIT"
    );
  }

  const duration = calculateMixDuration(ingredients, machine, controller.state.weather);

  pot.status = "mixing";
  pot.assignedMachineId = machine.id;
  machine.active = true;
  machine.potId = pot.id;
  machine.currentDuration = duration;
  hall.outputPotIds = (hall.outputPotIds ?? []).filter((id) => id !== pot.id);

  controller.renderPots();
  controller.renderHalls();
  controller.view.showStatus(
    `Machine gestart voor pot ${getPotNumber(controller.state, pot.id)}. Mengtijd: ${duration} ms.`,
    "info"
  );

  const timerId = setTimeout(() => {
    withErrorBoundary(() => controller.finishMachineRun(machine.id, pot.id));
  }, duration);

  controller.mixTimers.set(machine.id, timerId);
}

export function finishMachineRunAction(controller, machineId, potId) {
  const machine = controller.state.getMachineById(machineId);
  const hall = controller.state.getHallByMachineId(machineId);
  const pot = controller.state.getPotById(potId);
  const paint = createOrUpdateMixedPaint(controller.state, pot);

  pot.status = "mixed";
  pot.assignedMachineId = null;
  pot.mixedPaintId = paint.id;
  machine.active = false;
  machine.potId = null;
  machine.lastOutputPotId = pot.id;
  machine.currentDuration = 0;

  hall.outputPotIds = [pot.id, ...(hall.outputPotIds ?? []).filter((id) => id !== pot.id)].slice(0, 5);
  controller.mixTimers.delete(machine.id);

  if (!controller.state.selectedPaintId) {
    controller.state.selectedPaintId = paint.id;
  }

  controller.renderPots();
  controller.renderHalls();
  controller.renderPalette();
  controller.renderGrid();
  controller.view.showStatus(
    `Pot ${getPotNumber(controller.state, pot.id)} is klaar en beschikbaar als "${paint.name}".`,
    "success"
  );
}
