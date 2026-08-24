"use server";

import { getApiSessionToken } from "@/app/auth/getApiSessionToken";
import { apiFetch, errorMessage } from "@/app/lib/api";
import { GetNotificationsResponse } from "@home/shared";

const NOTIFICATION_URL = `${process.env.BASE_API_URL}/notifications`;

export const getNotifications = async (): Promise<GetNotificationsResponse> => {
  try {
    return await apiFetch<GetNotificationsResponse>(NOTIFICATION_URL, {
      authorization: await getApiSessionToken(),
    });
  } catch (error) {
    return { error: true, message: errorMessage(error) };
  }
};

export const readNotification = async () => {};

export const streamNotification = async () => {};
