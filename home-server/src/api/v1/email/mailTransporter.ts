import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
import Mail from "nodemailer/lib/mailer";
import { TZDate } from "@date-fns/tz";
import { EmailVerificationModel } from "../model/emailVerificationModel";

const EMAIL_OUTGOING_ADDRESS = process.env.EMAIL_OUTGOING_ADDRESS;
const EMAIL_OUTGOING_CLIENT_ID = process.env.EMAIL_OUTGOING_CLIENT_ID;
const EMAIL_OUTGOING_CLIENT_SECRET = process.env.EMAIL_OUTGOING_CLIENT_SECRET;
const EMAIL_OUTGOING_REFRESH_TOKEN = process.env.EMAIL_OUTGOING_REFRESH_TOKEN;
const EMAIL_OUTGOING_APP_PASSWORD = process.env.EMAIL_OUTGOING_APP_PASSWORD;

const PACIFIC_TZ = "America/Los_Angeles";

const pacificDayRange = (baseDate: Date = new Date()) => {
  const zonedNow = new TZDate(baseDate, PACIFIC_TZ);

  const year = zonedNow.getFullYear();
  const month = zonedNow.getMonth();
  const day = zonedNow.getDate();

  const start = new TZDate(year, month, day, 0, 0, 0, 0, PACIFIC_TZ);
  const end = new TZDate(year, month, day + 1, 0, 0, 0, 0, PACIFIC_TZ);

  return { start: new Date(start.valueOf()), end: new Date(end.valueOf()) };
};

const countEmailsSentToday = async () => {
  const { start, end } = pacificDayRange();

  return EmailVerificationModel.countDocuments({
    createdDate: { $gte: start, $lt: end },
  });
};

const createTransporter = async () => {
  const oauth2Client = new OAuth2Client(
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
        return reject(err);
      }
      resolve(token);
    });
  });

  return nodemailer.createTransport({
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
};

const createBackupTransporter = () =>
  nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: EMAIL_OUTGOING_ADDRESS,
      pass: EMAIL_OUTGOING_APP_PASSWORD,
    },
  });

const describe = (value: unknown) =>
  value instanceof Error ? value.message : JSON.stringify(value);

const fireBackupTransporter = async (safeMailOptions: Mail.Options) => {
  console.error("Transporter Error!");
  console.log("Attempting to send with backup transporter...");

  try {
    const res = await createBackupTransporter().sendMail(safeMailOptions);
    console.log(JSON.stringify(res, undefined, "  "));
    if (res.response.includes("OK")) {
      console.log(
        "Backup send appears to have been successful. Update the primary API key ASAP.",
      );
    }
    return { ok: true, response: describe(res) };
  } catch (e) {
    console.error("Backup Mail Send Error!");
    console.error(e);
    return { ok: false, response: describe(e) };
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
  const safeMailOptions: Mail.Options = { to, subject, text };

  try {
    const transporter = await createTransporter();
    const res = await transporter.sendMail(safeMailOptions);
    console.log(`Emails sent today: ${await countEmailsSentToday()}`);
    return { ok: true, response: describe(res) };
  } catch {
    return fireBackupTransporter(safeMailOptions);
  }
};
