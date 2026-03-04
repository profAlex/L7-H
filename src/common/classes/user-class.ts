import { randomUUID } from "node:crypto";
import { ObjectId } from "mongodb";

export class User {
    _id: ObjectId;
    id: string;
    login: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    emailConfirmation: {
        confirmationCode: string;
        expirationDate: Date;
        isConfirmed: boolean;
    };

    constructor(login: string, email: string, hash: string, _id: ObjectId) {
        this._id = _id;
        this.id = _id.toString();
        this.login = login;
        this.email = email;
        this.passwordHash = hash;
        this.createdAt = new Date();
        this.emailConfirmation = {
            confirmationCode: "",
            expirationDate: new Date(
                new Date().setDate(new Date().getMinutes() + 30),
            ),
            isConfirmed: false,
        };
    }
}
