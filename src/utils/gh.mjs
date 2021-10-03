import { $ } from 'zx';

export async function isLoggedIn(options) {
    if (options.useMock) {
        return true;
    } else {
        const loginStatus = (await $`gh auth status`).stderr;
        return loginStatus.includes('Logged in to');
    }
}

export async function graphql(options, { query, fixture }, variables) {
    if (options.useMock) {
        return fixture;
    }

    const variablesFields = Object.entries(variables)
        .map(([key, value]) => `-F ${key}='${value}'`)
        .join(' ');
    const cmd = `gh api graphql ${variablesFields} -f query='${query}'`;

    const response = await $([cmd]);

    if (response.stderr.length > 0) {
        throw new Error(response.stderr);
    } else {
        return JSON.parse(response.stdout);
    }
}