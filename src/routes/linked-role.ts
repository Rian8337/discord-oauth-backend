import { Router } from "express";
import * as discord from "../utils/discord";

/**
 * Route configured in the Discord developer console which facilitates the
 * connection between Discord and any additional services you may use.
 * To start the flow, generate the OAuth2 consent dialog url for Discord,
 * and redirect the user there.
 */
const router = Router();

router.get("/", (_, res) => {
    const { url, state } = discord.getOAuthURL();

    // Store the signed state param in the user's cookies so we can verify
    // the value later. See:
    // https://discord.com/developers/docs/topics/oauth2#state-and-security
    res.cookie("clientState", state, { maxAge: 1000 * 60 * 5, signed: true });

    // Send the user to the Discord owned OAuth2 authorization endpoint.
    res.redirect(url);
});

export default router;
