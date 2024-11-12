namespace NodeJS {
    interface ProcessEnv {
        /**
         * The client secret of the Discord application.
         */
        readonly DISCORD_CLIENT_SECRET?: string;

        /**
         * The client ID of the Discord application.
         */
        readonly DISCORD_CLIENT_ID?: string;

        /**
         * The redirect URI of the Discord application.
         */
        readonly DISCORD_REDIRECT_URI?: string;

        /**
         * The secret for the cookie session.
         */
        readonly COOKIE_SECRET?: string;

        /**
         * The Discord bot token.
         */
        readonly BOT_TOKEN?: string;

        /**
         * The database key to Elaina database.
         */
        readonly ELAINA_DB_KEY?: string;

        /**
         * The key to verify internal server operations.
         */
        readonly INTERNAL_SERVER_KEY?: string;

        /**
         * The hostname of the database for the official server.
         */
        readonly OFFICIAL_DB_HOSTNAME?: string;

        /**
         * The port of the database for the official server.
         */
        readonly OFFICIAL_DB_USERNAME?: string;

        /**
         * The username of the database for the official server.
         */
        readonly OFFICIAL_DB_PASSWORD?: string;

        /**
         * The password of the database for the official server.
         */
        readonly OFFICIAL_DB_NAME?: string;

        /**
         * The prefix of database names in the official server's database.
         */
        readonly OFFICIAL_DB_PREFIX?: string;
    }
}
