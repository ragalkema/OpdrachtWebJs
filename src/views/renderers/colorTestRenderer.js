export function renderPalette(elements, items, selectedPaintId) {
  if (items.length === 0) {
    elements.paletteList.innerHTML =
      '<p class="empty-state">Nog geen gemengde verf. Meng eerst een pot.</p>';
    return;
  }

  elements.paletteList.innerHTML = items
    .map(
      (item) => `
        <article class="palette-card ${item.id === selectedPaintId ? "is-selected" : ""}">
          <button
            type="button"
            class="palette-preview-button"
            data-palette-advice="${item.id}"
            aria-label="Toon triadic advies voor ${item.name}"
          >
            <div class="palette-preview" style="--swatch-color: ${item.colorValue}"></div>
          </button>
          <div class="palette-copy">
            <span>${item.name}</span>
            <strong>${item.colorValue}</strong>
          </div>
          <div class="palette-actions">
            <button type="button" class="secondary-button" data-palette-select="${item.id}">
              Gebruik
            </button>
            <button type="button" class="ghost-button" data-palette-advice="${item.id}">
              Triadic
            </button>
          </div>
        </article>
      `
    )
    .join("");
}

export function renderGrid(elements, grid, mixedPaints) {
  const paintMap = new Map(mixedPaints.map((paint) => [paint.id, paint]));
  elements.gridBoard.style.setProperty("--grid-columns", grid.columns);
  elements.gridBoard.innerHTML = grid.cells
    .map((paintId, index) => {
      const paint = paintId ? paintMap.get(paintId) : null;
      const label = paint ? `${paint.name} - ${paint.colorValue}` : "Leeg kleurvak";

      return `
        <button
          type="button"
          class="grid-cell ${paint ? "is-filled" : ""}"
          data-cell-index="${index}"
          style="--cell-color: ${paint?.colorValue ?? "rgba(255, 255, 255, 0.9)"}"
          aria-label="${label}"
          title="${label}"
        ></button>
      `;
    })
    .join("");
}

export function showTriadicColors(elements, basePaint, triadicColors) {
  elements.triadicSwatches.innerHTML = `
    <article class="triadic-item">
      <div class="triadic-preview" style="--swatch-color: ${basePaint.colorValue}"></div>
      <strong>${basePaint.name}</strong>
      <span>${basePaint.colorValue}</span>
    </article>
    ${triadicColors
      .map(
        (color) => `
          <article class="triadic-item">
            <div class="triadic-preview" style="--swatch-color: ${color.value}"></div>
            <strong>${color.label}</strong>
            <span>${color.value}</span>
          </article>
        `
      )
      .join("")}
  `;

  elements.triadicModal.showModal();
}
