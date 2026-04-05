import { AppError } from "./AppError.js";

function reportError(error) {
  console.error(`[ERROR] ${error.message}`, error);
  if (error.cause) {
    console.error("[ERROR_CAUSE]", error.cause);
  }
}

export function withErrorBoundary(task) {
  try {
    return task();
  } catch (error) {
    const handledError = normalizeError(error);
    reportError(handledError);
    return null;
  }
}

export async function handleAsyncError(task, { onError, fallbackMessage } = {}) {
  try {
    return await task();
  } catch (error) {
    const handledError = normalizeError(error, fallbackMessage);
    reportError(handledError);

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
