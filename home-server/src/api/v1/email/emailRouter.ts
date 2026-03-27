import { Router } from "express";

const emailRouter = Router();

emailRouter.get("/", (req, res) => {
  res.status(200).send({ message: "Email Router" });
});

export default emailRouter;
