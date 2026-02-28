// import dotenv from "dotenv";
// dotenv.config();

import "dotenv/config";

// дефолтные значения параметров
const DEFAULT_PORT = "3003";
const DEFAULT_JWT_EXPIRES_IN = "60";

// структура конфигурационных значений
type Config = {
    appPort: number;
    jwtSecret: string;
    jwtExpiresIn: number;
};

// парсинг значений
const getConfig = (): Config => {
    let appPort = process.env.PORT;
    let jwtSecret = process.env.JWT_SECRET;
    let jwtExpiresIn = process.env.JWT_EXPIRES_IN;

    // валидация
    if (!appPort) {
        console.warn(
            `PORT is not defined in .env! Applied default port number ${DEFAULT_PORT}.`,
        );
        appPort = DEFAULT_PORT;
    }

    if (!jwtExpiresIn) {
        console.warn(
            `JWT_EXPIRES_IN is not defined in .env! Applied default port number: ${DEFAULT_JWT_EXPIRES_IN}.`,
        );
        jwtExpiresIn = DEFAULT_PORT;
    }

    // if (!jwtSecret) throw new Error("JWT_SECRET is required in .env");
    if (!jwtSecret) {
        console.warn(
            "JWT_SECRET is not defined in .env! Applied default value.",
        );
        jwtSecret = "ryuas235GCPHvlt347782uzHBSDuw4hr";
    }

    return {
        appPort: parseInt(appPort, 10),
        jwtSecret,
        jwtExpiresIn: parseInt(jwtExpiresIn, 10),
    };
};

export const envConfig = getConfig();
