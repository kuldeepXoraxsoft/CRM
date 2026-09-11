// Custom error class - throw new ApiError(404, "Lead not found") from any
// controller and the central error handler will format the response.
export default class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}