"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const node_crypto_1 = require("node:crypto");
class User {
    constructor(login, email, hash, _id) {
        this._id = _id;
        this.id = _id.toString();
        this.login = login;
        this.email = email;
        this.passwordHash = hash;
        this.createdAt = new Date();
        this.emailConfirmation = {
            confirmationCode: (0, node_crypto_1.randomUUID)(),
            expirationDate: new Date(new Date().setDate(new Date().getMinutes() + 30)),
            isConfirmed: false,
        };
    }
}
exports.User = User;
