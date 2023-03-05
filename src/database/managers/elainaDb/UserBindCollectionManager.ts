import { IUserBind } from "./IUserBind";
import { Collection } from "mongodb";
import { DatabaseCollectionManager } from "../../DatabaseCollectionManager";
import { RoleConnectionMetadata } from "../../../utils/RoleConnectionMetadata";

/**
 * A manager for the `userbind` collection.
 */
export class UserBindCollectionManager extends DatabaseCollectionManager<IUserBind> {
    override get defaultDocument(): IUserBind {
        return {
            discordid: "",
            playc: 0,
            pptotal: 0,
        };
    }

    /**
     * @param collection The MongoDB collection.
     */
    constructor(collection: Collection<IUserBind>) {
        super(collection);
    }

    /**
     * Gets the role connection metadata of a Discord user.
     *
     * @param discordId The ID of the user.
     * @returns The role connection metadata, `null` if the user is not binded.
     */
    async fetchMetadata(
        discordId: string
    ): Promise<RoleConnectionMetadata | null> {
        const bind = await this.getOne(
            { discordid: discordId },
            {
                projection: {
                    _id: 0,
                    pptotal: 1,
                    playc: 1,
                },
            }
        );

        if (!bind) {
            return null;
        }

        return {
            pp: Math.round(bind.pptotal),
            playcount: bind.playc,
            rank: await this.getUserDPPRank(bind.pptotal),
        };
    }

    /**
     * Gets the dpp rank of a specified dpp value.
     *
     * @param totalPP The total PP.
     */
    private async getUserDPPRank(totalPP: number): Promise<number> {
        return (
            (await this.collection.countDocuments({
                pptotal: { $gt: totalPP },
            })) + 1
        );
    }
}
