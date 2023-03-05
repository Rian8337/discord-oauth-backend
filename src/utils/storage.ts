import { RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

const directory = join(process.cwd(), "files", "tokens");

export async function storeDiscordTokens(
    userId: string,
    tokens: RESTPostOAuth2AccessTokenResult
) {
    await ensureDirectoryExists();
    await writeFile(join(directory, `${userId}.json`), JSON.stringify(tokens));
}

export async function getDiscordTokens(
    userId: string
): Promise<RESTPostOAuth2AccessTokenResult> {
    await ensureDirectoryExists();

    return JSON.parse(
        await readFile(join(directory, `${userId}.json`), {
            encoding: "utf-8",
        })
    );
}

async function ensureDirectoryExists() {
    try {
        await mkdir(directory, { recursive: true });
    } catch {}
}
