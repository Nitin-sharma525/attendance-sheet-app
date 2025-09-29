const nodeMailer = require("nodemailer");

const newModelObj = {};

newModelObj.generalMail = function (emailData) {
    return new Promise((resolve, reject) => {
        let transporter = nodeMailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "nitinzeroit@gmail.com",
                pass: "hzlx tfqa rrnk nfad",
            },
        });

        let mailOptions ={
            from: emailData.from,
            to: emailData.to,
            subject: "Your OTP for Registration",
            html: emailData.body,
            
        
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Mail send error:", error);
                return resolve(false);
            }
            return resolve(true);
        });
    });
};

module.exports = newModelObj;



