export class AppError extends Error {
  constructor(message, code = "APP_ERROR", cause = null) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.cause = cause;
  }
}
