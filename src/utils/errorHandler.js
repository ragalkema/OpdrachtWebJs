import { AppError } from "./AppError.js";

export function withErrorBoundary(task, view) {
  try {
    return task();
  } catch (error) {
    const handledError = normalizeError(error);
    console.error(handledError);
    view.showStatus(handledError.message, "error");
    return null;
  }
}

export async function handleAsyncError(task, { onError, fallbackMessage }) {
  try {
    return await task();
  } catch (error) {
    const handledError = normalizeError(error, fallbackMessage);
    console.error(handledError);

    if (typeof onError === "function") {
      onError(handledError);
    }

    return null;
  }
}

export function normalizeError(error, fallbackMessage = "Er ging iets mis.") {
  if (error instanceof AppError) {
    return error;
  }

  return new AppError(fallbackMessage, "UNEXPECTED_ERROR", error);
}
