/**
 * Metadata for role connections.
 */
export interface RoleConnectionMetadata
    extends Record<string, string | number> {
    /**
     * The performance points this user has.
     */
    pp: number;

    /**
     * The rank of the user.
     */
    rank: number;

    /**
     * The play count of the user.
     */
    playcount: number;
}
