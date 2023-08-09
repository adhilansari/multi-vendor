class ErrorHandler extends Error {
  statusCode: number;

  constructor(message:any, statusCode: number = 500) {
      super(message);
      this.statusCode = statusCode;

      Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;