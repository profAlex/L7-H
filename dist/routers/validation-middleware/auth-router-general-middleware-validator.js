"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrationConfirmationValidator = void 0;
const express_validator_1 = require("express-validator");
const registrationConfirmationCodeValidator = (0, express_validator_1.body)("code")
    .exists()
    .withMessage("Field 'code' is required")
    .isString()
    .withMessage("Field 'code' must be of type string");
exports.registrationConfirmationValidator = [
    registrationConfirmationCodeValidator,
];
