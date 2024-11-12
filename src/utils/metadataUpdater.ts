import { RoleConnectionMetadata } from "./RoleConnectionMetadata";
import * as discord from "./discord";
import * as storage from "./storage";
import { DatabaseManager } from "../database/DatabaseManager";
import { pool } from "../database/officialDatabase";
import { RowDataPacket } from "mysql2";
import { OfficialDatabaseUser } from "../database/OfficialDatabaseUser";

/**
 * Given a Discord UserId, push static make-believe data to the Discord
 * metadata endpoint.
 */
export default async function (userId: string) {
    // Fetch the Discord tokens from storage
    const tokens = await storage.getDiscordTokens(userId);

    if (!tokens) {
        return;
    }

    let metadata: RoleConnectionMetadata | Record<string, string | number> = {};
    const table = `${process.env.OFFICIAL_DB_PREFIX}user`;

    try {
        const bindInfo =
            await DatabaseManager.elainaDb.collections.userBind.getOne(
                { discordid: userId },
                { projection: { _id: 0, uid: 1 } }
            );

        if (!bindInfo) {
            return;
        }

        const player = await pool
            .query<RowDataPacket[]>(
                `SELECT pp, playcount FROM ${table} WHERE id = ?`,
                [bindInfo.uid]
            )
            .then((res) => res.at(0)?.at(0) as OfficialDatabaseUser)
            .catch(() => null);

        if (!player) {
            return;
        }

        const rank = await pool
            .query<RowDataPacket[]>(
                `SELECT COUNT(*) + 1 FROM ${table} WHERE banned = 0 AND restrict_mode = 0 AND archived = 0 AND pp > (SELECT pp FROM ${table} WHERE id = ?);`,
                [bindInfo.uid]
            )
            .then(
                (res) =>
                    (res[0] as { "COUNT(*) + 1": number }[]).at(0)?.[
                        "COUNT(*) + 1"
                    ] ?? null
            )
            .catch(() => null);

        if (rank === null) {
            return;
        }

        metadata = {
            pp: player.pp,
            playcount: player.playcount,
            rank: rank,
        };
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
