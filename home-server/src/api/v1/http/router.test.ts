import express from "express";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "./apiError";
import { ApiMessage } from "./messages";
import { sendSuccess } from "./respond";
import { route } from "./router";

const appWith = (handler: Parameters<typeof route>[0]) =>
  express().get("/", route(handler));

describe("route", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("responds without an error", async () => {
    const app = appWith((req, res) =>
      sendSuccess(res, { message: "Hello, world." }),
    );

    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Hello, world.", error: false });
  });

  it("responds with the status and message of a thrown ApiError", async () => {
    const app = appWith(() => {
      throw new ApiError(ApiMessage.FORBIDDEN, 403);
    });

    const response = await request(app).get("/");

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: ApiMessage.FORBIDDEN,
      error: true,
    });
  });

  it("responds with a failure when the handler throws anything else", async () => {
    const app = appWith(() => {
      throw new Error("boom");
    });

    const response = await request(app).get("/");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: ApiMessage.UNEXPECTED,
      error: true,
    });
  });
});
