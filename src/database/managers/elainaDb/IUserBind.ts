/**
 * Represents a Discord user who has at least one osu!droid account binded.
 */
export interface IUserBind {
    /**
     * The Discord ID of the user.
     */
    discordid: string;

    /**
     * The total droid performance points (dpp) that the user has.
     */
    pptotal: number;

    /**
     * The play count of the user (how many scores the user have submitted into the dpp system).
     */
    playc: number;
}
