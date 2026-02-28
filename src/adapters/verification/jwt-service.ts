import jwt from "jsonwebtoken";
import { envConfig } from "../../config";
import { JwtPayloadType } from "./payload-type";
import { token } from "./token-type";
import { HttpStatus } from "../../common/http-statuses/http-statuses";
import { CustomResult } from "../../common/result-type/result-type";
import { LoginSuccessViewModel } from "./auth-success-login-model";

export const jwtService = {
    async createToken(
        payload: JwtPayloadType,
    ): Promise<CustomResult<LoginSuccessViewModel>> {
        if (!payload.userId) {
            console.error(
                "Failed attempt to check credentials login or password",
            );

            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "Failed attempt to check credentials login or password",
                errorsMessages: [
                    {
                        field: "createToken -> if (!payload.userId)",
                        message: "userId is empty",
                    },
                ],
            } as CustomResult<LoginSuccessViewModel>;
        }

        try {
            const resultedToken = jwt.sign(payload, envConfig.jwtSecret, {
                expiresIn: envConfig.jwtExpiresIn,
            });

            return {
                data: { accessToken: resultedToken },
                statusCode: HttpStatus.NoContent,
                errorsMessages: [{ field: null, message: null }],
            };
        } catch (e: unknown) {
            console.error("Can't sign with JWT service: ", e);
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "Failed attempt to check credentials login or password",
                errorsMessages: [
                    {
                        field: "createToken -> jwt.sign()",
                        message:
                            "Unknown error while attempting to sign payload",
                    },
                ],
            } as CustomResult<LoginSuccessViewModel>;
        }
    },

    async decodeToken(token: string): Promise<JwtPayloadType | null> {
        try {
            return jwt.decode(token) as JwtPayloadType;
        } catch (e: unknown) {
            console.error("Can't decode token with JWT service: ", e);
            return null;
        }
    },

    async verifyToken(token: string): Promise<JwtPayloadType | null> {
        try {
            return jwt.verify(token, envConfig.jwtSecret) as JwtPayloadType;
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.error("Token verification error with JWT service: ", e);
            } else {
                console.error(
                    "Unknown error with JWT verification service: ",
                    e,
                );
            }
            return null;
        }
    },
};
