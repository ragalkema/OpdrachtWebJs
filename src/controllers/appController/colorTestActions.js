import { AppError } from "../../utils/AppError.js";
import { getTriadicRgbStrings } from "../../utils/colorUtils.js";

export function selectPaintAction(controller, paintId) {
  const paint = controller.state.getPaintById(paintId);
  controller.state.selectedPaintId = paint.id;
  controller.renderPalette();
  controller.view.showStatus(`"${paint.name}" is geselecteerd voor het grid.`, "info");
}

export function showPaintAdviceAction(controller, paintId) {
  const paint = controller.state.getPaintById(paintId);
  const triadicColors = getTriadicRgbStrings(paint.colorValue).map((value, index) => ({
    label: `Advies ${index + 1}`,
    value,
  }));

  controller.view.showTriadicColors(paint, triadicColors);
}

export function paintGridCellAction(controller, cellIndex) {
  if (!controller.state.selectedPaintId) {
    throw new AppError("Selecteer eerst een gemengde verf.", "PAINT_NOT_SELECTED");
  }

  controller.state.getPaintById(controller.state.selectedPaintId);
  controller.state.paintCell(cellIndex, controller.state.selectedPaintId);
  controller.renderGrid();
}
