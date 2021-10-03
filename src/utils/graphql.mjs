import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import {exit_error} from "./cli.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function createQuery(name) {
    const fixture = loadFixture(name);
    const query = fs.readFileSync(`${__dirname}/../graphql/${name}.graphql`, 'utf8');
    return { query, fixture };
}

function loadFixture(name) {
    const file = `${__dirname}/../graphql/${name}.json`;
    if (!fs.existsSync(file)) {
        return new Proxy({}, {
            get() {
                exit_error('Mock could not be loaded. If you are using the published package from npmjs, then mocks are intentionally removed.');
            }
        });
    }
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}