import { Router } from "express";
import { CreateAccountResponse } from "../types/response";

const accountManagementRouter = Router();

accountManagementRouter.get("/", (req, res) => {
  res.status(200).send({ message: "Account Management Router" });
});

accountManagementRouter.post("/createAccount", (req, res) => {
  const createAccountResponse: CreateAccountResponse = {
    error: false,
    message: "Account created successfully",
    jwt: "fakejwt",
    user: req.body,
  };
  res.status(200).send(createAccountResponse);
});

export default accountManagementRouter;
