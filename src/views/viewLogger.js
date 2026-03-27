const STATUS_LOGGERS = {
  warning: console.warn,
  success: console.info,
  info: console.info,
};

export function showStatus(message, tone = "info") {
  if (tone === "error") {
    return;
  }

  const logger = STATUS_LOGGERS[tone] ?? console.log;
  logger(`[${tone.toUpperCase()}] ${message}`);
}

export function showError(error) {
  console.error(`[ERROR] ${error.message}`, error);
  if (error.cause) {
    console.error("[ERROR_CAUSE]", error.cause);
  }
}
