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
exports.provideUserInfo = exports.attemptToLogin = void 0;
const auth_service_1 = require("../../service-layer(BLL)/auth-service");
const http_statuses_1 = require("../../common/http-statuses/http-statuses");
const query_repository_1 = require("../../repository-layers/query-repository-layer/query-repository");
const attemptToLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { loginOrEmail, password } = req.body;
    const loginResult = yield auth_service_1.authService.loginUser(loginOrEmail, password);
    if (!loginResult.data) {
        console.error("Error description: ", loginResult === null || loginResult === void 0 ? void 0 : loginResult.statusDescription, JSON.stringify(loginResult.errorsMessages));
        return res.status(loginResult.statusCode).send("Error");
    }
    return res.status(http_statuses_1.HttpStatus.Ok).send(loginResult.data);
});
exports.attemptToLogin = attemptToLogin;
const provideUserInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        console.error("req.user is not found");
        return res
            .status(http_statuses_1.HttpStatus.InternalServerError)
            .json("Not authorized");
    }
    const userId = req.user.userId;
    if (!userId) {
        console.error("userId inside req.user is undefined or null");
        return res
            .status(http_statuses_1.HttpStatus.InternalServerError)
            .json("Not authorized");
    }
    const userInfo = yield query_repository_1.dataQueryRepository.findUserForMe(userId);
    return res.status(http_statuses_1.HttpStatus.Ok).send(userInfo);
});
exports.provideUserInfo = provideUserInfo;
