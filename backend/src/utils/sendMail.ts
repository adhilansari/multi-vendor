import * as nodemailer from "nodemailer";

interface MailOptions {
  email: string;
  subject: string;
  message: string;
}

const sendMail = async (options: MailOptions) => {
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  
  const mailOptions: nodemailer.SendMailOptions = {
    from: process.env.SMTP_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };


  await transporter.sendMail(mailOptions);
  
};

export default sendMail;
