import { NextFunction, Request, Response } from "express";
import { LoginInputModel } from "../router-types/login-input-model";
import { authService } from "../../service-layer(BLL)/auth-service";
import { CustomResult } from "../../common/result-type/result-type";
import { token } from "../../adapters/verification/token-type";
import { HttpStatus } from "../../common/http-statuses/http-statuses";
import { RequestWithBody, RequestWithUserId } from "../request-types/request-types";
import { UserIdType } from "../router-types/user-id-type";
import { dataQueryRepository } from "../../repository-layers/query-repository-layer/query-repository";
import { LoginSuccessViewModel } from "../../adapters/verification/auth-success-login-model";
import { AuthLoginInputModel } from "../router-types/auth-login-input-model";
import { RegistrationUserInputModel } from "../router-types/auth-registration-input-model";

export const attemptToLogin = async (
    req: Request<{}, {}, AuthLoginInputModel, {}>,
    res: Response,
) => {
    const { loginOrEmail, password } = req.body;
    const loginResult: CustomResult<LoginSuccessViewModel> =
        await authService.loginUser(loginOrEmail, password);

    if (!loginResult.data) {
        console.error(
            "Error description: ",
            loginResult?.statusDescription,
            JSON.stringify(loginResult.errorsMessages),
        );

        return res.status(loginResult.statusCode).send("Error");
    }

    return res.status(HttpStatus.Ok).send(loginResult.data);
};

export const provideUserInfo = async (
    req: RequestWithUserId<UserIdType>,
    res: Response,
) => {
    if (!req.user) {
        console.error("req.user is not found");
        return res
            .status(HttpStatus.InternalServerError)
            .json("Not authorized");
    }

    const userId = req.user.userId;
    if (!userId) {
        console.error("userId inside req.user is undefined or null");
        return res
            .status(HttpStatus.InternalServerError)
            .json("Not authorized");
    }

    // ДОЛЖНО ИДТИ ЧЕРЕЗ СЕРВИС!
    const userInfo = await dataQueryRepository.findUserForMe(userId);
    return res.status(HttpStatus.Ok).send(userInfo);
};

export const registrationAttemptByUser = async (
    req: RequestWithBody<RegistrationUserInputModel>,
    res: Response,
) => {
    // const { loginOrEmail, password } = req.body;
    const registrationResult: CustomResult =
        await authService.registerNewUser(req.body);

    if (registrationResult.statusCode !== HttpStatus.Ok) {
        console.error(
            "Error description: ",
            registrationResult?.statusDescription,
            JSON.stringify(registrationResult.errorsMessages),
        );

        return res.status(registrationResult.statusCode).send("Error");
    }

    return res.sendStatus(HttpStatus.NoContent);

};
