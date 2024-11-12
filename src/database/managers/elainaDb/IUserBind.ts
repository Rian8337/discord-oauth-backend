/**
 * Represents a Discord user who has an osu!droid account binded.
 */
export interface IUserBind {
    /**
     * The Discord ID of the user.
     */
    readonly discordid: string;

    /**
     * The ID of the osu!droid account binded to the user.
     */
    readonly uid: number;
}
