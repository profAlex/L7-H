import { UserIdType } from "./user-id-type";

declare global {
    declare namespace Express {
        export interface Request {
            user: UserIdType | undefined;
        }
    }
}
