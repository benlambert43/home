"use server";

import { GetNotificationsResponse } from "@/app/types/response";
import { cookies } from "next/headers";

const NOTIFICATION_URL = `${process.env.BASE_API_URL}/notifications`;

export const getNotifications = async () => {
  const cookieStore = await cookies();
  const apiSessionCookie = cookieStore.get("apisession");

  try {
    const response = await fetch(NOTIFICATION_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiSessionCookie?.value || "",
      },
    });
    if (!response.ok) {
      const maybeResponse = await response.json();
      const maybeResponseMessage = maybeResponse?.message;
      throw new Error(
        maybeResponseMessage
          ? maybeResponseMessage
          : `response.status ${response.status}`,
      );
    }

    const json = await response.json();

    const getNotificationsResponse: GetNotificationsResponse = {
      error: json.error,
      message: json.message,
      notifications: json.notifications,
    };

    if (
      getNotificationsResponse.error === false &&
      typeof getNotificationsResponse.notifications !== "undefined"
    ) {
      return getNotificationsResponse;
    } else {
      throw new Error(getNotificationsResponse.message);
    }
  } catch (error: any) {
    const errorString =
      "message" in error ? `${error.message.toString()}` : "Unknown error.";

    const getNotificationsErrorResponse: GetNotificationsResponse = {
      error: true,
      message: errorString,
    };

    return getNotificationsErrorResponse;
  }
};

export const readNotification = async () => {};

export const streamNotification = async () => {};
