import { IUserBind } from "./IUserBind";
import { Collection } from "mongodb";
import { DatabaseCollectionManager } from "../../DatabaseCollectionManager";

/**
 * A manager for the `userbind` collection.
 */
export class UserBindCollectionManager extends DatabaseCollectionManager<IUserBind> {
    override get defaultDocument(): IUserBind {
        return {
            discordid: "",
            uid: 0,
        };
    }

    /**
     * @param collection The MongoDB collection.
     */
    constructor(collection: Collection<IUserBind>) {
        super(collection);
    }
}
