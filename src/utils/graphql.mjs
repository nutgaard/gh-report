import { request } from 'https';
import { parse } from 'url';
import * as Tmpl from './template.mjs';

const apiUrl = 'https://api.github.com/graphql';
const url = parse(apiUrl);

export function createQuery(name, variables) {
    const fixture = JSON.parse(fs.readFileSync(`${__dirname}/graphql/${name}.json`, 'utf8'));
    const template = fs.readFileSync(`${__dirname}/graphql/${name}.graphql`, 'utf8');
    const query = Tmpl.replaceVars(template, variables);
    return { query, fixture };
}

export function fetch(options, { query, fixture }, variables) {
    if (options.useMock) {
        return fixture;
    }
    const payload = JSON.stringify({query, variables});
    return new Promise((resolve, reject) => {
        const req_opt = {
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            protocol: url.protocol,
            headers: {
                'Content-Type': "application/json",
                'Content-Length': payload.length,
                'Authorization': `bearer ${options.token}`,
                'User-Agent': "GitHub GraphQL Client"
            },
        };

        const req = request(req_opt, (res) => {
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk.toString('utf8')));
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    return reject(res.statusMessage);
                }
                const response = chunks.join('');
                let json = undefined;
                try {
                    json = JSON.parse(response);
                } catch (e) {
                    return reject('Response not parsable as json');
                }
                if (json.error) {
                    return reject(json.error);
                }
                if (!json.data) {
                    console.log('PAYLOAD', payload);
                    console.log('ERRRRR', JSON.stringify(json, null, 2));
                    return reject('Unknown GraphQL error, missing data.');
                }
                return resolve(json);
            })
        });
        req.on('error', (err) => reject(err));
        req.write(payload);
        req.end();
    });
}