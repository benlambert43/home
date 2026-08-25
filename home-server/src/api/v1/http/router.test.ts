import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { namedRouter } from "./router";

describe("namedRouter", () => {
  it("responds without an error", async () => {
    const app = express().use("/", namedRouter("Test Router"));

    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Test Router.", error: false });
  });
});
