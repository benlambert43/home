export class ApiError extends Error {
  constructor(
    message: string,
    readonly status = 400,
    readonly detail?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
