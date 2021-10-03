export function createQuery(name) {
    const fixture = JSON.parse(fs.readFileSync(`${__dirname}/graphql/${name}.json`, 'utf8'));
    const query = fs.readFileSync(`${__dirname}/graphql/${name}.graphql`, 'utf8');
    return { query, fixture };
}