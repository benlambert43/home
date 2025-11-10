import nodemailer from "nodemailer";
import { google } from "googleapis";
import { configDotenv } from "dotenv";
import Mail from "nodemailer/lib/mailer";
const OAuth2 = google.auth.OAuth2;
configDotenv();

const EMAIL_OUTGOING_ADDRESS = process.env.EMAIL_OUTGOING_ADDRESS;
const EMAIL_OUTGOING_JWT_SECRET = process.env.EMAIL_OUTGOING_JWT_SECRET;
const EMAIL_OUTGOING_CLIENT_ID = process.env.EMAIL_OUTGOING_CLIENT_ID;
const EMAIL_OUTGOING_CLIENT_SECRET = process.env.EMAIL_OUTGOING_CLIENT_SECRET;
const EMAIL_OUTGOING_REFRESH_TOKEN = process.env.EMAIL_OUTGOING_REFRESH_TOKEN;
const EMAIL_OUTGOING_APP_PASSWORD = process.env.EMAIL_OUTGOING_APP_PASSWORD;

const createTransporter = async () => {
  try {
    const oauth2Client = new OAuth2(
      EMAIL_OUTGOING_CLIENT_ID,
      EMAIL_OUTGOING_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: EMAIL_OUTGOING_REFRESH_TOKEN,
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
        user: EMAIL_OUTGOING_ADDRESS,
        clientId: EMAIL_OUTGOING_CLIENT_ID,
        clientSecret: EMAIL_OUTGOING_CLIENT_SECRET,
        refreshToken: EMAIL_OUTGOING_REFRESH_TOKEN,
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
        user: EMAIL_OUTGOING_ADDRESS,
        pass: EMAIL_OUTGOING_APP_PASSWORD,
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
