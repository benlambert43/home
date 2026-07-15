import nodemailer from "nodemailer";
import { google } from "googleapis";
import Mail from "nodemailer/lib/mailer";
const OAuth2 = google.auth.OAuth2;

const EMAIL_OUTGOING_ADDRESS = process.env.EMAIL_OUTGOING_ADDRESS;
const EMAIL_OUTGOING_CLIENT_ID = process.env.EMAIL_OUTGOING_CLIENT_ID;
const EMAIL_OUTGOING_CLIENT_SECRET = process.env.EMAIL_OUTGOING_CLIENT_SECRET;
const EMAIL_OUTGOING_REFRESH_TOKEN = process.env.EMAIL_OUTGOING_REFRESH_TOKEN;
const EMAIL_OUTGOING_APP_PASSWORD = process.env.EMAIL_OUTGOING_APP_PASSWORD;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    EMAIL_OUTGOING_CLIENT_ID,
    EMAIL_OUTGOING_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground",
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
};

const createBackupTransporter = () => {
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
};

const fireBackupTransporter = async (safeMailOptions: Mail.Options) => {
  console.error("Transporter Error!");
  console.log("Attempting to send with backup transporter...");
  const backupTransporter = createBackupTransporter();
  if (backupTransporter) {
    try {
      const res = await backupTransporter.sendMail(safeMailOptions);
      console.log(JSON.stringify(res, undefined, "  "));
      if (res.response.includes("OK")) {
        console.log(
          "Backup send appears to have been successful. Update the primary API key ASAP.",
        );
      }
      return { code: 0, error: undefined, response: res };
    } catch (e) {
      console.error("Backup Mail Send Error!");
      console.error(e);
      return { code: 1, error: e, response: e };
    }
  } else {
    console.error("Backup Transporter Error!");
    return {
      code: 1,
      error: "backupTransporter error!",
      response: "backupTransporter error!",
    };
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

  // Try to create a Transporter, and if that fails, create the backup transporter.
  try {
    // Try with the primary transporter using API keys. If that fails, use the App Key password.
    try {
      const transporter = await createTransporter();
      const res = await transporter.sendMail(safeMailOptions);
      return { code: 0, error: undefined, response: res };
    } catch (e) {
      const backupRes = await fireBackupTransporter(safeMailOptions);

      return {
        code: backupRes.code,
        error: backupRes.error,
        response: backupRes.response,
      };
    }
  } catch (e) {
    return { code: 1, error: e, response: e };
  }
};
