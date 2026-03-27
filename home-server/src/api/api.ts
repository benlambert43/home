import { Router } from "express";
import v1Router from "./v1/v1";

const apiRouter = Router();

apiRouter.get("/", (req, res) => {
  res.status(200).send({ message: "API Router" });
});

apiRouter.use("/v1", v1Router);

export default apiRouter;
