const STATUS_LOGGERS = {
  warning: console.warn,
  success: console.info,
  info: console.info,
};

export function showStatus(message, tone = "info") {
  const logger = STATUS_LOGGERS[tone] ?? console.log;
  logger(`[${tone.toUpperCase()}] ${message}`);
}
