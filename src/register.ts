import {
    ApplicationRoleConnectionMetadataType,
    RESTPutAPIApplicationRoleConnectionMetadataJSONBody,
    RouteBases,
    Routes,
} from "discord-api-types/v10";
import { config } from "dotenv";

// Register the metadata to be stored by Discord. This should be a one time action.
// Note: uses a Bot token for authentication, not a user token.

config();

const url =
    RouteBases.api +
    Routes.applicationRoleConnectionMetadata(process.env.DISCORD_CLIENT_ID!);

const body: RESTPutAPIApplicationRoleConnectionMetadataJSONBody = [
    {
        name: "Rank",
        key: "rank",
        description:
            "The rank of this player in the droid performance points leaderboard",
        type: ApplicationRoleConnectionMetadataType.IntegerLessThanOrEqual,
    },
    {
        name: "Performance Points",
        key: "pp",
        description: "The performance points of this player",
        type: ApplicationRoleConnectionMetadataType.IntegerGreaterThanOrEqual,
    },
    {
        name: "Play Count",
        key: "playcount",
        description: "The amount of times this player has played",
        type: ApplicationRoleConnectionMetadataType.IntegerGreaterThanOrEqual,
    },
];

(async () => {
    const response = await fetch(url, {
        method: "PUT",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bot ${process.env.BOT_TOKEN}`,
        },
    });

    if (response.ok) {
        console.log(await response.json());
    } else {
        console.error(await response.text());
    }
})();
