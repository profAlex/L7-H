import nodemailer from "nodemailer";

export const emailExamples = {
    registrationEmail(code: string) {
        return ` <h1>Thank for your registration</h1>
               <p>To finish registration please follow the link below:<br>
                  <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
              </p>`
    },
    passwordRecoveryEmail(code: string) {
        return `<h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
            <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
        </p>`
    }
}

export const mailerService = {
    async sendConfirmationRegisterEmail(from: string, to: string, subject:string, text:string, ) {

        const transporter = nodemailer.createTransport({
            host: "smtp.yandex.ru",
            port: 465,
            secure: true, // использовать SSL
            auth: {
                user: "geniusb198",
                pass: "bxehtsazcuonvgug"
            }
        });

        const mailOptions = {
            from: "\"Alex St\" <geniusb198@yandex.ru>", // имя и email отправителя
            to: "geniusb198@yandex.ru", // адрес получателя
            subject: "Тестовое письмо", // тема письма
            text: "Привет! Это простое текстовое письмо.", // текст письма
            html: '<h1>Это HTML-письмо</h1>', // если нужно отправить HTML
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log("Письмо отправлено:", info.messageId);
        } catch (error) {
            console.error("Ошибка отправки письма:", error);
        }

    },

    async sendEmail(
        email: string,
        code: string,
        template: (code: string) => string
    ): Promise<boolean> {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: appConfig.EMAIL,
                pass: appConfig.EMAIL_PASS
            }
        });

        let info = await transporter.sendMail({
            from: "\"Kek 👻\" <codeSender>",
            to: email,
            subject: "Your code is here",
            html: template(code) // html body
        });

        return !!info;
    }
};