import nodemailer from "nodemailer";
import { google } from "googleapis";
import Mail from "nodemailer/lib/mailer";
const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  try {
    const oauth2Client = new OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });

    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        resolve(token);
      });
    });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_ADDRESS,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken ? (accessToken as string) : "",
      },
    });

    return transporter;
  } catch (e) {
    console.error(e);
    return undefined;
  }
};

const createBackupTransporter = () => {
  try {
    const backupTransporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.APP_PASSWORD,
      },
    });
    return backupTransporter;
  } catch (e) {
    console.error(e);
    return undefined;
  }
};

export const sendMail = async ({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) => {
  const safeMailOptions: Mail.Options = {
    to: to,
    subject: subject,
    text: text,
  };

  const transporter = await createTransporter();

  if (transporter) {
    try {
      transporter.sendMail(safeMailOptions);
      return 0;
    } catch (e) {
      console.error("Mail Send Error!");
      console.error(e);
      return 1;
    }
  } else {
    console.error("Transporter Error!");
    const backupTransporter = createBackupTransporter();
    if (backupTransporter) {
      try {
        backupTransporter.sendMail(safeMailOptions);
        return 0;
      } catch (e) {
        console.error("Backup Mail Send Error!");
        console.error(e);
        return 1;
      }
    } else {
      console.error("Backup Transporter Error!");
      return 1;
    }
  }
};
