import { randomUUID } from "crypto";
import {
    OAuth2Routes,
    RESTGetAPIOAuth2CurrentAuthorizationResult,
    RESTOAuth2AuthorizationQuery,
    RESTPostOAuth2AccessTokenResult,
    RESTPostOAuth2AccessTokenURLEncodedData,
    RESTPostOAuth2RefreshTokenResult,
    RESTPostOAuth2RefreshTokenURLEncodedData,
    RESTPutAPICurrentUserApplicationRoleConnectionJSONBody,
    RouteBases,
    Routes,
} from "discord-api-types/v10";
import * as storage from "./storage";
import { RoleConnectionMetadata } from "./RoleConnectionMetadata";

/**
 * Generate the URL which the user will be directed to in order to approve the
 * bot, and see the list of requested scopes.
 */
export function getOAuthURL() {
    const state = randomUUID();

    const url = new URL(OAuth2Routes.authorizationURL);
    const searchParams: RESTOAuth2AuthorizationQuery = {
        client_id: process.env.DISCORD_CLIENT_ID!,
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
        response_type: "code",
        state: state,
        scope: "role_connections.write identify",
        prompt: "consent",
    };

    url.searchParams.set("client_id", searchParams.client_id);
    url.searchParams.set("redirect_uri", searchParams.redirect_uri!);
    url.searchParams.set("response_type", searchParams.response_type);
    url.searchParams.set("state", searchParams.state!);
    url.searchParams.set("scope", searchParams.scope);
    url.searchParams.set("prompt", searchParams.prompt!);

    return { state, url: url.toString() };
}

/**
 * Given an OAuth2 code from the scope approval page, make a request to Discord's
 * OAuth2 service to retrieve an access token, refresh token, and expiration.
 */
export async function getOAuthTokens(
    code: string
): Promise<RESTPostOAuth2AccessTokenResult> {
    const url = OAuth2Routes.tokenURL;
    const body = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI!,
    } satisfies RESTPostOAuth2AccessTokenURLEncodedData);

    const response = await fetch(url, {
        body,
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    if (response.ok) {
        return response.json();
    } else {
        throw new Error(
            `Error fetching OAuth tokens: [${response.status}] ${response.statusText}`
        );
    }
}

/**
 * The initial token request comes with both an access token and a refresh
 * token.  Check if the access token has expired, and if it has, use the
 * refresh token to acquire a new, fresh access token.
 */
export async function getAccessToken(
    userId: string,
    tokens: RESTPostOAuth2AccessTokenResult
) {
    if (Date.now() > tokens.expires_in) {
        const url = OAuth2Routes.tokenURL;
        const body = new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID!,
            client_secret: process.env.DISCORD_CLIENT_SECRET!,
            grant_type: "refresh_token",
            refresh_token: tokens.refresh_token,
        } satisfies RESTPostOAuth2RefreshTokenURLEncodedData);
        const response = await fetch(url, {
            body,
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        if (response.ok) {
            const tokens: RESTPostOAuth2RefreshTokenResult =
                await response.json();

            tokens.expires_in = Date.now() + tokens.expires_in * 1000;
            await storage.storeDiscordTokens(userId, tokens);

            return tokens.access_token;
        } else {
            throw new Error(
                `Error refreshing access token: [${response.status}] ${response.statusText}`
            );
        }
    }
    return tokens.access_token;
}

/**
 * Given a user based access token, fetch profile information for the current user.
 */
export async function getUserData(
    tokens: RESTPostOAuth2AccessTokenResult
): Promise<RESTGetAPIOAuth2CurrentAuthorizationResult> {
    const url = RouteBases.api + Routes.oauth2CurrentAuthorization();
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${tokens.access_token}`,
        },
    });

    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        throw new Error(
            `Error fetching user data: [${response.status}] ${response.statusText}`
        );
    }
}

/**
 * Given metadata that matches the schema, push that data to Discord on behalf
 * of the current user.
 */
export async function pushMetadata(
    userId: string,
    tokens: RESTPostOAuth2AccessTokenResult,
    metadata: RoleConnectionMetadata | Record<string, string | number>
) {
    // PUT /users/@me/applications/:id/role-connection
    const url =
        RouteBases.api +
        Routes.userApplicationRoleConnection(process.env.DISCORD_CLIENT_ID!);
    const accessToken = await getAccessToken(userId, tokens);
    const body: RESTPutAPICurrentUserApplicationRoleConnectionJSONBody = {
        platform_name: "osu!droid",
        platform_username: "Droid Performance Points",
        metadata,
    };

    const response = await fetch(url, {
        method: "PUT",
        body: JSON.stringify(body),
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(
            `Error pushing Discord metadata: [${response.status}] ${response.statusText}`
        );
    }
}

/**
 * Fetch the metadata currently pushed to Discord for the currently logged
 * in user, for this specific bot.
 */
export async function getMetadata(
    userId: string,
    tokens: RESTPostOAuth2AccessTokenResult
): Promise<RoleConnectionMetadata> {
    const url =
        RouteBases.api +
        Routes.userApplicationRoleConnection(process.env.DISCORD_CLIENT_ID!);
    const accessToken = await getAccessToken(userId, tokens);

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (response.ok) {
        return response.json();
    } else {
        throw new Error(
            `Error getting Discord metadata: [${response.status}] ${response.statusText}`
        );
    }
}
