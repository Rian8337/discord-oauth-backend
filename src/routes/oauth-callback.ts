import { Router } from "express";
import updateMetadata from "../utils/metadataUpdater";
import * as discord from "../utils/discord";
import * as storage from "../utils/storage";

/**
 * Route configured in the Discord developer console, the redirect Url to which
 * the user is sent after approving the bot for their Discord account. This
 * completes a few steps:
 * 1. Uses the code to acquire Discord OAuth2 tokens
 * 2. Uses the Discord Access Token to fetch the user profile
 * 3. Stores the OAuth2 Discord Tokens in a file
 * 4. Lets the user know it's all good and to go back to Discord
 */
const router = Router();

router.get<never, unknown, unknown, { code: string; state: string }>(
    "/",
    async (req, res) => {
        try {
            // 1. Uses the code and state to acquire Discord OAuth2 tokens
            const code: string = req.query.code;
            const discordState: string = req.query.state;

            // Make sure the state parameter exists.
            const clientState: string = req.signedCookies.clientState;
            if (clientState !== discordState) {
                return res.sendStatus(403);
            }

            const tokens = await discord.getOAuthTokens(code);

            // 2. Uses the Discord Access Token to fetch the user profile
            const meData = await discord.getUserData(tokens);
            const userId = meData.user!.id;

            tokens.expires_in = Date.now() + tokens.expires_in * 1000;
            await storage.storeDiscordTokens(userId, tokens);

            // 3. Update the users metadata. Future updates will be posted to the `/update-metadata` endpoint
            await updateMetadata(userId);

            res.send("You did it! Now go back to Discord.");
        } catch (e) {
            console.error(e);
            res.sendStatus(500);
        }
    }
);

export default router;
