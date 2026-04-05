export function renderTriadicModal() {
  return `
    <dialog class="triadic-modal" data-js="triadic-modal">
      <form method="dialog" class="modal-card">
        <div class="section-heading">
          <h2>Triadic kleuradvies</h2>
          <button type="submit" class="ghost-button">Sluiten</button>
        </div>
        <div class="triadic-swatches" data-js="triadic-swatches"></div>
      </form>
    </dialog>
  `;
}
