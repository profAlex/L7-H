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
import { ObjectId } from "mongodb";
import { User } from "../common/classes/user-class";
import { emailExamples, mailerService } from "../adapters/email-sender/mailer-service";



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

            if (ifUserLoginExists) {
                return {
                    data: null,
                    statusCode: HttpStatus.BadRequest,
                    statusDescription:
                        "authService -> registerNewUser -> if(ifUserLoginExists)",
                    errorsMessages: [
                        {
                            field: "login",
                            message: "Email or Login already exists!!!"
                        }
                    ]
                };
            }

            if (ifUserEmailExists) {
                return {
                    data: null,
                    statusCode: HttpStatus.BadRequest,
                    statusDescription:
                        "authService -> registerNewUser -> if(ifUserEmailExists)",
                    errorsMessages: [
                        {
                            field: "email",
                            message: "Email or Login already exists!!!"
                        }
                    ]
                };
            }

            const passwordHash = await bcryptService.generateHash(
                sentData.password
            );

            if (!passwordHash) {
                return {
                    data: null,
                    statusCode: HttpStatus.InternalServerError,
                    statusDescription: "",
                    errorsMessages: [
                        {
                            field: "bcryptService.generateHash",
                            message: "Generating hash error"
                        }
                    ]
                };
            }

            const tempId = new ObjectId();

            // console.log(
            //     "REGISTERED NEW HERE <-------------",
            //     tempId.toString()
            // );
            // нижеследующее заменили на инициализацию через клас User через extend interface UserCollectionStorageModel
            // const newUserEntry = {
            //     _id: tempId,
            //     id: tempId.toString(),
            //     login: sentNewUser.login,
            //     email: sentNewUser.email,
            //     passwordHash: passwordHash,
            //     createdAt: new Date(),
            // } as UserCollectionStorageModel;

            const newUserEntry = new User(
                sentData.login,
                sentData.email,
                passwordHash,
                tempId
            );

            const newUserInsertionResult = await dataCommandRepository.registerNewUser(newUserEntry);

            if(newUserInsertionResult.statusCode !== HttpStatus.Ok ) {
                return {
                    data: newUserInsertionResult.data,
                    statusCode: newUserInsertionResult.statusCode,
                    statusDescription: newUserInsertionResult.statusDescription,
                    errorsMessages: newUserInsertionResult.errorsMessages
                };
            }

            // здесь отсылка письма. с точки зрения обработки потенциальных ошибок
            // максимум того что целесообразно сделать, это в том случае если по какой-то причине с нашей стороны чтото сломалось
            // никак не говорить об этом юзерам, пускай они самостоятельно повторно отправляют запрос, мы максимум логируем ошибку
            // тут жестко будет связано с политикой компании по этому поводу
            // так делается чтобы не брать на себя лишней работы, т.к. в случае реальной проблемы с сервисом отправки мы так или иначе будем это чинить
            // а если письмо просто потерялось или юзер тупит - для нас это может быть куча лишней работы по обслуживанию непонятно чего
            // так что во втором случае пусть юзер сам лучше на себя возьмет это работу - просто повторно отправит если что запррос, нам главно оптимально подобрать период удалления неподтвержденных данных (минут 15-30)

            const sendingResult = await mailerService.sendConfirmationRegisterEmail(
                "\"Alex St\" <geniusb198@yandex.ru>",
                newUserEntry.email,
                newUserEntry.emailConfirmation.confirmationCode,
                emailExamples.registrationEmail
            );

            let status = "Sending went without problems, awaiting confirmation form user";
            if (!sendingResult) {
                console.error("Something went wrong while sending the registration email");
                status = "Something went wrong while sending the registration email";
            }

            // отправка результата что все ОК
            return {
                data: null,
                statusCode: HttpStatus.NoContent,
                statusDescription: status,
                errorsMessages: [
                    {
                        field: "",
                        message: ""
                    }
                ]
            };

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
                            field: "email",
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
