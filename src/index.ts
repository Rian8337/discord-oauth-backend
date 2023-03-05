import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import linkedRole from "./routes/linked-role";
import oauthCallback from "./routes/oauth-callback";
import updateMetadata from "./routes/update-metadata";
import { DatabaseManager } from "./database/DatabaseManager";
import { config } from "dotenv";

//#region App configuration

config();

const app = express();

app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

//#endregion

//#region Endpoints

const mainRouter = express.Router();
app.use("/api/discord", mainRouter);

mainRouter.use("/linked-role", linkedRole);
mainRouter.use("/oauth-callback", oauthCallback);
mainRouter.use("/update-metadata", updateMetadata);

//#endregion

//#region App launch

// Connect to database, then open server
DatabaseManager.init().then(() => {
    const appPort = parseInt(process.env.PORT || "3004");

    app.listen(appPort, () => console.log(`Express running → PORT ${appPort}`));
});

//#endregion
