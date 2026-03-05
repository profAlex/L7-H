import { body } from "express-validator";



const registrationConfirmationCodeValidator = body("code")
    .exists()
    .withMessage("Field 'code' is required")
    .isString()
    .withMessage("Field 'code' must be of type string");


export const registrationConfirmationValidator = [
    registrationConfirmationCodeValidator,
];
