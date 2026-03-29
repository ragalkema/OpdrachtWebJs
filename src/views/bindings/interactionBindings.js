function readDragPayload(event) {
  try {
    return JSON.parse(event.dataTransfer.getData("text/plain"));
  } catch {
    return null;
  }
}

export function bindDragAndDrop(documentRef, elements, { onIngredientDrop, onPotDrop }) {
  documentRef.addEventListener("selectstart", (event) => {
    if (event.target.closest("[data-drag-type]")) {
      event.preventDefault();
    }
  });

  documentRef.addEventListener("dragstart", (event) => {
    const draggable = event.target.closest("[data-drag-type]");

    if (!draggable) {
      return;
    }

    documentRef.getSelection()?.removeAllRanges();
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        type: draggable.dataset.dragType,
        id: draggable.dataset.dragId,
      })
    );
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setDragImage(draggable, 24, 24);
  });

  elements.potList.addEventListener("dragover", (event) => {
    if (event.target.closest("[data-pot-id]")) {
      event.preventDefault();
    }
  });

  elements.potList.addEventListener("drop", (event) => {
    const target = event.target.closest("[data-pot-id]");

    if (!target) {
      return;
    }

    const payload = readDragPayload(event);

    if (payload?.type === "ingredient") {
      event.preventDefault();
      onIngredientDrop({
        ingredientId: payload.id,
        potId: target.dataset.potId,
      });
    }
  });

  elements.hallStage.addEventListener("dragover", (event) => {
    if (event.target.closest("[data-machine-id]")) {
      event.preventDefault();
    }
  });

  elements.hallStage.addEventListener("drop", (event) => {
    const target = event.target.closest("[data-machine-id]");

    if (!target) {
      return;
    }

    const payload = readDragPayload(event);

    if (payload?.type === "pot") {
      event.preventDefault();
      onPotDrop({
        potId: payload.id,
        machineId: target.dataset.machineId,
      });
    }
  });
}

export function bindPaletteSelect(elements, handler) {
  elements.paletteList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-palette-select]");

    if (button) {
      handler(button.dataset.paletteSelect);
    }
  });
}

export function bindPotRemoval(elements, handler) {
  elements.potList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-pot-remove]");

    if (button) {
      event.preventDefault();
      event.stopPropagation();
      handler(button.dataset.potRemove);
    }
  });
}

export function bindPaletteAdvice(elements, handler) {
  elements.paletteList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-palette-advice]");

    if (button) {
      handler(button.dataset.paletteAdvice);
    }
  });
}

export function bindGridCellClick(elements, handler) {
  elements.gridBoard.addEventListener("click", (event) => {
    const cell = event.target.closest("[data-cell-index]");

    if (cell) {
      handler(Number(cell.dataset.cellIndex));
    }
  });
}
