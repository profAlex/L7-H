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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config");
const http_statuses_1 = require("../../common/http-statuses/http-statuses");
exports.jwtService = {
    createToken(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!payload.userId) {
                console.error("Failed attempt to check credentials login or password");
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "Failed attempt to check credentials login or password",
                    errorsMessages: [
                        {
                            field: "createToken -> if (!payload.userId)",
                            message: "userId is empty",
                        },
                    ],
                };
            }
            try {
                const resultedToken = jsonwebtoken_1.default.sign(payload, config_1.envConfig.jwtSecret, {
                    expiresIn: config_1.envConfig.jwtExpiresIn,
                });
                return {
                    data: { accessToken: resultedToken },
                    statusCode: http_statuses_1.HttpStatus.NoContent,
                    errorsMessages: [{ field: null, message: null }],
                };
            }
            catch (e) {
                console.error("Can't sign with JWT service: ", e);
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "Failed attempt to check credentials login or password",
                    errorsMessages: [
                        {
                            field: "createToken -> jwt.sign()",
                            message: "Unknown error while attempting to sign payload",
                        },
                    ],
                };
            }
        });
    },
    decodeToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return jsonwebtoken_1.default.decode(token);
            }
            catch (e) {
                console.error("Can't decode token with JWT service: ", e);
                return null;
            }
        });
    },
    verifyToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return jsonwebtoken_1.default.verify(token, config_1.envConfig.jwtSecret);
            }
            catch (e) {
                if (e instanceof Error) {
                    console.error("Token verification error with JWT service: ", e);
                }
                else {
                    console.error("Unknown error with JWT verification service: ", e);
                }
                return null;
            }
        });
    },
};
