import v1Router from "./v1/v1";
import { namedRouter } from "./v1/http/router";

const apiRouter = namedRouter("API Router");

apiRouter.use("/v1", v1Router);

export default apiRouter;
