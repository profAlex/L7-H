import { dataQueryRepository } from "../repository-layers/query-repository-layer/query-repository";
import { bcryptService } from "../adapters/authentication/bcrypt-service";
import { jwtService } from "../adapters/verification/jwt-service";
import { CustomResult } from "../common/result-type/result-type";
import { JwtPayloadType } from "../adapters/verification/payload-type";
import { HttpStatus } from "../common/http-statuses/http-statuses";
import { token } from "../adapters/verification/token-type";
import { LoginSuccessViewModel } from "../adapters/verification/auth-success-login-model";
import { RegistrationUserInputModel } from "../routers/router-types/auth-registration-input-model";
import { dataCommandRepository } from "../repository-layers/command-repository-layer/command-repository";
import { RegistrationConfirmationInput } from "../routers/router-types/auth-registration-confirmation-input-model";
import {
    ResentRegistrationConfirmationInput
} from "../routers/router-types/auth-resent-registration-confirmation-input-model";



export const authService = {
    async loginUser(
        loginOrEmail: string,
        password: string
    ): Promise<CustomResult<LoginSuccessViewModel>> {
        const user = await dataQueryRepository.findByLoginOrEmail(loginOrEmail);

        if (!user)
            return {
                data: null,
                statusCode: HttpStatus.Unauthorized,
                statusDescription: "Wrong login or password", // по сути это "User does not exist", но на фронт такие детали не должны утекать
                errorsMessages: [
                    {
                        field: "dataQueryRepository.findByLoginOrEmail", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                        message: "Wrong login or password"
                    }
                ]
            };

        const isCorrectCredentials = await this.checkUserCredentials(
            password,
            user.passwordHash
        );

        if (isCorrectCredentials === false) {
            return {
                data: null,
                statusCode: HttpStatus.Unauthorized,
                statusDescription: "Wrong login or password",
                errorsMessages: [
                    {
                        field: "loginUser -> checkUserCredentials",
                        message: "Wrong login or password"
                    }
                ]
            };
        } else if (isCorrectCredentials === null) {
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "Failed attempt to check credentials login or password",
                errorsMessages: [
                    {
                        field: "loginUser -> checkUserCredentials",
                        message:
                            "Failed attempt to check credentials login or password"
                    }
                ]
            };
        }

        const resultedToken = await jwtService.createToken({ userId: user.id });

        return resultedToken;
    },

    // пробуем зарегистрировать возвращенный от юзера код подтверждения
    async confirmRegistrationCode(
        sentData: RegistrationConfirmationInput
    ): Promise<CustomResult> {
        try {

            return await dataCommandRepository.confirmRegistrationCode(sentData);

        } catch (error) {
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "Unknown error in authService -> confirmRegistrationCode",
                errorsMessages: [
                    {
                        field: "",
                        message: "Unknown error"
                    }
                ]
            };
        }

    },


    // пробуем зарегистрировать пользователя по его запросу (т.е. по запросу фронта)
    async registerNewUser(
        sentData: RegistrationUserInputModel
    ): Promise<CustomResult> {
        try {

            const ifUserLoginExists = await dataCommandRepository.findByLoginOrEmail(sentData.login);
            const ifUserEmailExists = await dataCommandRepository.findByLoginOrEmail(sentData.email);

            if (ifUserLoginExists || ifUserEmailExists) {
                return {
                    data: null,
                    statusCode: HttpStatus.BadRequest,
                    statusDescription:
                        "authService -> registerNewUser -> if(ifUserLoginExists || ifUserEmailExists)",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Email or Login already exists"
                        }
                    ]
                };
            }

            return await dataCommandRepository.registerNewUser(sentData);

        } catch (error) {
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "Unknown error in authService -> registerNewUser",
                errorsMessages: [
                    {
                        field: "",
                        message: "Unknown error"
                    }
                ]
            };
        }
    },


    async resendConfirmRegistrationCode(
        sentData: ResentRegistrationConfirmationInput
    ): Promise<CustomResult> {
        try {

            const isUserInDatabase = await dataCommandRepository.findNotConfirmedByEmail(sentData.email);

            if (!isUserInDatabase) {
                return {
                    data: null,
                    statusCode: HttpStatus.BadRequest,
                    statusDescription:
                        "authService -> resendConfirmRegistrationCode -> if (isUserInDatabase)",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Email doesn't exist or already confirmed"
                        }
                    ]
                };
            }

            return await dataCommandRepository.resendConfirmRegistrationCode(sentData, isUserInDatabase);

        } catch (error) {
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "Unknown error in authService -> resendConfirmRegistrationCode",
                errorsMessages: [
                    {
                        field: "",
                        message: "Unknown error"
                    }
                ]
            };
        }

    },


    // вспомогательная функция
    async checkUserCredentials(
        password: string,
        passwordHash: string
    ): Promise<boolean | null> {
        return bcryptService.checkPassword(
            password,
            passwordHash
        );
    }
};
