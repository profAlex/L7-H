import { NextFunction, Request, Response } from "express";
import {
    RequestWithParamsAndBodyAndUserId,
    RequestWithUserId,
} from "../request-types/request-types";
import { UserIdType } from "../router-types/user-id-type";
import { HttpStatus } from "../../common/http-statuses/http-statuses";
import { JwtPayloadType } from "../../adapters/verification/payload-type";
import { jwtService } from "../../adapters/verification/jwt-service";

export const tokenGuardVerification = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (!req.headers.authorization)
        return res.status(HttpStatus.Unauthorized).json({
            error: `Field req.headers.authorization has improper format`,
        });

    if (!req.headers.authorization.startsWith("Bearer "))
        return res.status(HttpStatus.Unauthorized).json({
            error: `Field req.headers.authorization has improper format`,
        });

    const sentToken = req.headers.authorization.split(" ")[1];
    const payload: JwtPayloadType | null =
        await jwtService.verifyToken(sentToken);

    if (!payload)
        return res.status(HttpStatus.Unauthorized).json({
            error: `Field req.headers.authorization has improper format`,
        });

    req.user = { userId: payload.userId } as UserIdType;
    return next();
};
