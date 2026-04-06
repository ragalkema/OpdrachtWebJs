export function renderAppAction(controller) {
  controller.view.setActivePage(controller.state.activePage);
  controller.view.renderWeather(controller.state.weather);
  controller.renderIngredients();
  controller.renderPots();
  controller.renderHalls();
  controller.renderPalette();
  controller.renderGrid();
}

export function renderIngredientsAction(controller) {
  const availableIngredients = controller.state.ingredients.filter((ingredient) => !ingredient.potId);
  controller.view.renderIngredients(availableIngredients);
}

export function renderPotsAction(controller) {
  controller.view.renderPots(
    controller.state.pots,
    controller.state.ingredients,
    controller.state.mixedPaints
  );
}

export function renderHallsAction(controller) {
  controller.view.renderHalls(
    controller.state.halls,
    controller.state.activeHallId,
    controller.state.pots,
    controller.state.ingredients,
    controller.state.mixedPaints,
    controller.state.weather
  );
}

export function renderPaletteAction(controller) {
  controller.view.renderPalette(controller.state.mixedPaints, controller.state.selectedPaintId);
}

export function renderGridAction(controller) {
  controller.view.renderGrid(controller.state.grid, controller.state.mixedPaints);
}
