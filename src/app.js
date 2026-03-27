import { AppController } from "./controllers/AppController.js";
import { AppState } from "./models/AppState.js";
import { AppView } from "./views/AppView.js";
import { handleAsyncError } from "./utils/errorHandler.js";

const state = new AppState();
const view = new AppView(document);
const controller = new AppController(state, view);

handleAsyncError(() => controller.init(), {
  fallbackMessage: "De applicatie kon niet correct opstarten.",
  onError: (error) => view.showStatus(error.message, "error"),
});
