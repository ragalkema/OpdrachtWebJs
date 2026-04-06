import { AppController } from "./controllers/AppController.js";
import { AppState } from "./models/AppState.js";
import { AppView } from "./views/AppView.js";
import { renderAppLayout } from "./views/appLayout.js";
import { handleAsyncError } from "./utils/errorHandler.js";

renderAppLayout(document);

const state = new AppState();
const view = new AppView(document);
const controller = new AppController(state, view);

handleAsyncError(() => controller.init(), {
  fallbackMessage: "De applicatie kon niet correct opstarten.",
});
