// errors/appError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public errorCode: string = "INTERNAL_SERVER_ERROR", // Add errorCode
    public isOperational: boolean = true
  ) {
    super(message);


    //This line is important when extending built-in classes like Error in JavaScript. Without it, your AppError might not behave correctly (e.g., instanceof checks might fail).
    // This line makes sure that your object (this) is correctly recognized as an instance of AppError.
    Object.setPrototypeOf(this, new.target.prototype);

    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Update specific errors
export class ValidationError extends AppError {
  constructor(message: string = "Validation failed") {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class AuthError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(message, 401, "AUTH_ERROR");
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict") {
    super(message, 409, "CONFLICT_ERROR");
  }
}

export class SignUpError extends AppError {
  constructor(message: string = "SignUp Failed") {
    super(message, 500, "SIGNUP_ERROR");
  }
}
