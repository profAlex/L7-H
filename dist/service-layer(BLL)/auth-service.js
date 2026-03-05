"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const query_repository_1 = require("../repository-layers/query-repository-layer/query-repository");
const bcrypt_service_1 = require("../adapters/authentication/bcrypt-service");
const jwt_service_1 = require("../adapters/verification/jwt-service");
const http_statuses_1 = require("../common/http-statuses/http-statuses");
const command_repository_1 = require("../repository-layers/command-repository-layer/command-repository");
exports.authService = {
    loginUser(loginOrEmail, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield query_repository_1.dataQueryRepository.findByLoginOrEmail(loginOrEmail);
            if (!user)
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.Unauthorized,
                    statusDescription: "Wrong login or password", // по сути это "User does not exist", но на фронт такие детали не должны утекать
                    errorsMessages: [
                        {
                            field: "dataQueryRepository.findByLoginOrEmail", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                            message: "Wrong login or password"
                        }
                    ]
                };
            const isCorrectCredentials = yield this.checkUserCredentials(password, user.passwordHash);
            if (isCorrectCredentials === false) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.Unauthorized,
                    statusDescription: "Wrong login or password",
                    errorsMessages: [
                        {
                            field: "loginUser -> checkUserCredentials",
                            message: "Wrong login or password"
                        }
                    ]
                };
            }
            else if (isCorrectCredentials === null) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "Failed attempt to check credentials login or password",
                    errorsMessages: [
                        {
                            field: "loginUser -> checkUserCredentials",
                            message: "Failed attempt to check credentials login or password"
                        }
                    ]
                };
            }
            const resultedToken = yield jwt_service_1.jwtService.createToken({ userId: user.id });
            return resultedToken;
        });
    },
    // пробуем зарегистрировать возвращенный от юзера код подтверждения
    confirmRegistrationCode(sentData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield command_repository_1.dataCommandRepository.confirmRegistrationCode(sentData);
            }
            catch (error) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "Unknown error in authService -> confirmRegistrationCode",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Unknown error"
                        }
                    ]
                };
            }
        });
    },
    // пробуем зарегистрировать пользователя по его запросу (т.е. по запросу фронта)
    registerNewUser(sentData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ifUserLoginExists = yield command_repository_1.dataCommandRepository.findByLoginOrEmail(sentData.login);
                const ifUserEmailExists = yield command_repository_1.dataCommandRepository.findByLoginOrEmail(sentData.login);
                if (ifUserLoginExists || ifUserEmailExists) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.BadRequest,
                        statusDescription: "authService -> registerNewUser -> if(ifUserLoginExists || ifUserEmailExists)",
                        errorsMessages: [
                            {
                                field: "",
                                message: "Email or Login already exists"
                            }
                        ]
                    };
                }
                return yield command_repository_1.dataCommandRepository.registerNewUser(sentData);
            }
            catch (error) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "Unknown error in authService -> registerNewUser",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Unknown error"
                        }
                    ]
                };
            }
        });
    },
    // вспомогательная функция
    checkUserCredentials(password, passwordHash) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcrypt_service_1.bcryptService.checkPassword(password, passwordHash);
        });
    }
};
