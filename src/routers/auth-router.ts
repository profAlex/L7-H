import { Router } from "express";
import { inputErrorManagementMiddleware } from "./validation-middleware/error-management-validation-middleware";
import {
    loginInputModelValidation,
    userInputModelValidation
} from "./validation-middleware/UserInputModel-validation-middleware";
import {
    attemptToLogin,
    provideUserInfo, registrationAttemptByUser, registrationConfirmation
} from "./router-handlers/auth-router-description";
import { tokenGuardVerification } from "./guard-middleware/token-guard";
import { registrationConfirmationValidator } from "./validation-middleware/auth-router-general-middleware-validator";



export const authRouter = Router();

// Try login user to the system
authRouter.post(
    "/login",
    loginInputModelValidation,
    inputErrorManagementMiddleware,
    attemptToLogin
);

authRouter.post(
    "/registration-confirmation)",
    registrationConfirmationValidator,
    inputErrorManagementMiddleware,
    registrationConfirmation
);

// Registration in the system. Email with confirmation code will be send to passed email address
authRouter.post(
    "/registration",
    userInputModelValidation,
    inputErrorManagementMiddleware,
    registrationAttemptByUser
);

// Get information about current user
authRouter.get(
    "/me",
    tokenGuardVerification,
    provideUserInfo
);
