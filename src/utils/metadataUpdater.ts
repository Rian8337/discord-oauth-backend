import { RoleConnectionMetadata } from "./RoleConnectionMetadata";
import * as discord from "./discord";
import * as storage from "./storage";
import { DatabaseManager } from "../database/DatabaseManager";

/**
 * Given a Discord UserId, push static make-believe data to the Discord
 * metadata endpoint.
 */
export default async function (userId: string) {
    // Fetch the Discord tokens from storage
    const tokens = await storage.getDiscordTokens(userId);

    let metadata: RoleConnectionMetadata | Record<string, string | number> = {};

    try {
        metadata =
            (await DatabaseManager.elainaDb.collections.userBind.fetchMetadata(
                userId
            )) ?? {};
    } catch (e) {
        (<Error>e).message = `Error fetching external data: ${
            (<Error>e).message
        }`;
        console.error(e);
        // If fetching the profile data for the external service fails for any reason,
        // ensure metadata on the Discord side is nulled out. This prevents cases
        // where the user revokes an external app permissions, and is left with
        // stale linked role data.
    }

    // Push the data to Discord.
    await discord.pushMetadata(userId, tokens, metadata);
}
