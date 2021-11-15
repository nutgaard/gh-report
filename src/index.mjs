#!/usr/bin/env node
import { $, argv, chalk } from 'zx';
import * as GraphQL from './utils/graphql.mjs';
import * as Reporter from './reporter/reporter.mjs';
import * as GH from './utils/gh.mjs';
import * as Color from './utils/colors.mjs';
import terminalReporter from './reporter/terminal-reporter.mjs';
import markdownReporter from './reporter/markdown-reporter.mjs';
import {exit_error} from "./utils/cli.mjs";
import './utils/gh.mjs';

const reporters = {
    'terminal': terminalReporter,
    'markdown': markdownReporter
};
if (argv.help || argv.h) {
    console.log();
    console.log(`
${Color.main('GH-Report')}
Automatically look for PR merges the last week for a given team.

${Color.accent('gh-report myorg/myteam')}

Options:
    -l, --limit:    Extend the number of PRs checked for each repo. 
                    Default: 10
             
    -d, --since:    Set the cutoff for which PRs er relevant.
                    Default: now() - 1w
                    Example: 2021-09-15
                 
    -r, --reporter: Set the reporter format
                    Default: terminal
                    Options: terminal, markdown
                    
Examples:
    Specify the cutoff for relevant PRs 
    ${Color.accent('gh-report myorg/myteam --since 2021-09-01')}
    
    Increase the limit when fetching PRs for github 
    ${Color.accent('gh-report myorg/myteam --limit 20')}
    
    Print the report in markdown 
    ${Color.accent('gh-report myorg/myteam --reporter markdown')}
    `.trim());
    console.log();
    console.log();
    process.exit(0);
}

const options = {
    useMock: argv.mock ?? false,
    limit: argv.l ?? argv.limit ?? 10,
    since: (() => {
        if (argv.d) {
            return new Date(argv.d).toISOString()
        } else if (argv.since) {
            return new Date(argv.since).toISOString()
        } else {
            return new Date(new Date().getTime() - 7 * 24 * 3600 * 1000).toISOString()
        }
    })(),
    reporter: (() => {
        if (argv.r) {
            return reporters[argv.r];
        } else if (argv.reporter) {
            return reporters[argv.reporter];
        } else {
            return terminalReporter;
        }
    })()
};

(async () => {


if (!(await GH.isLoggedIn(options))) {
    exit_error('User not logged in through `gh`-cli. Use `gh auth login` to fix');
}

const [orgteam] = argv._;
if (!orgteam) {
    exit_error(`Need to specify team, e.g run: 'gh-report myorg/myteam'`);
} else if (!orgteam.includes('/')) {
    exit_error(`Format of team is wrong, should be run: 'gh-report myorg/myteam'`);
}
const [organization, team] = orgteam.split("/");

const query = GraphQL.createQuery('get-prs-to-branch', { 'SINCE': options.since });
const result = await GH.graphql(options, query, {
    'organization': organization,
    'team': team,
    'limit': options.limit
});

const ignoreRepos = ['vault-iac', 'jenkins-dsl-scripts'];
const repositories = result.data.organization.team.repositories.nodes
    .filter((repo) => !repo.isArchived)
    .filter((repo) => !ignoreRepos.includes(repo.name));

const repos_maxed_out = Object.fromEntries(
    repositories.map((repo) => [repo.name, false])
);

const changes = repositories
    .map((repo) => {
        const name = repo.name;
        const allPRs = (repo.master?.nodes ?? []).concat((repo.dev?.nodes ?? []));
        repos_maxed_out[name] = allPRs.length === 0 || allPRs.some((pr) => pr.mergedAt < options.since);

        const master = (repo.master?.nodes ?? [])
            .filter((pr) => pr.mergedAt > options.since)
            .map((pr) => ({ ...pr, author: pr.author.login }));

        const masterTitles = master.map((pr) => pr.title);
        const dev = (repo.dev?.nodes ?? [])
            .filter((pr) => pr.mergedAt > options.since)
            .filter((pr) => !masterTitles.some((masterTitle) => masterTitle.includes(pr.title)))
            .map((pr) => ({ ...pr, author: pr.author.login }));
        const changeValueHeuristic = 100 * master.length + dev.length

        return {
            name,
            changeValueHeuristic,
            master,
            dev
        }
    })
    .sort((a, b) => b.changeValueHeuristic - a.changeValueHeuristic);

const report = Reporter.report(changes, options, options.reporter);
console.log(report);

const potentiallyMissingPRs = Object.entries(repos_maxed_out)
    .filter(([repo, gotAllPrs]) => !gotAllPrs)
    .map(([repo]) => repo)
    .join(', ');
if (potentiallyMissingPRs.length > 0) {
    console.log(chalk.red(`
Some repositories may potentially have missing PRs because of current limit (${options.limit}).
${potentiallyMissingPRs}
`.trim()))
}
})();