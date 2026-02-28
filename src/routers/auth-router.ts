import { Router } from "express";
import { inputErrorManagementMiddleware } from "./validation-middleware/error-management-validation-middleware";
import { loginInputModelValidation } from "./validation-middleware/UserInputModel-validation-middleware";
import {
    attemptToLogin,
    provideUserInfo,
} from "./router-handlers/auth-router-description";
import { tokenGuardVerification } from "./guard-middleware/token-guard";

export const authRouter = Router();

authRouter.post(
    "/login",
    loginInputModelValidation,
    inputErrorManagementMiddleware,
    attemptToLogin,
);

authRouter.get("/me", tokenGuardVerification, provideUserInfo);
