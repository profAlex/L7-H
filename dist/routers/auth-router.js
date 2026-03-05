"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const error_management_validation_middleware_1 = require("./validation-middleware/error-management-validation-middleware");
const UserInputModel_validation_middleware_1 = require("./validation-middleware/UserInputModel-validation-middleware");
const auth_router_description_1 = require("./router-handlers/auth-router-description");
const token_guard_1 = require("./guard-middleware/token-guard");
const auth_router_general_middleware_validator_1 = require("./validation-middleware/auth-router-general-middleware-validator");
exports.authRouter = (0, express_1.Router)();
// Try login user to the system
exports.authRouter.post("/login", UserInputModel_validation_middleware_1.loginInputModelValidation, error_management_validation_middleware_1.inputErrorManagementMiddleware, auth_router_description_1.attemptToLogin);
exports.authRouter.post("/registration-confirmation", auth_router_general_middleware_validator_1.registrationConfirmationValidator, error_management_validation_middleware_1.inputErrorManagementMiddleware, auth_router_description_1.registrationConfirmation);
// Registration in the system. Email with confirmation code will be send to passed email address
exports.authRouter.post("/registration", UserInputModel_validation_middleware_1.userInputModelValidation, error_management_validation_middleware_1.inputErrorManagementMiddleware, auth_router_description_1.registrationAttemptByUser);
// Get information about current user
exports.authRouter.get("/me", token_guard_1.tokenGuardVerification, auth_router_description_1.provideUserInfo);
