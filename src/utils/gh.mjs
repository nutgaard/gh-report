import {exit_error} from "./cli.mjs";
import fs from "fs";
export async function getToken(options) {
    if (options.useMock) {
        return 'mock-token';
    }
    const loginStatus = (await $`gh auth status`).stderr;
    if (!loginStatus.includes('Logged in to')) {
        exit_error('User not logged in through `gh`-cli. Use `gh auth login` to fix');
    }
    const auth_status = loginStatus.match(/\((.+)\)/);
    const tokenLocation = auth_status[1];
    const ghAuthData = fs.readFileSync(tokenLocation, 'utf8');
    const tokenMatch = ghAuthData.match(/oauth_token: ([\w\d]+)/);
    if (!tokenMatch) {
        exit_error('Authentication status failed, could not extract token ' + tokenLocation);
    }
    return tokenMatch[1];
}