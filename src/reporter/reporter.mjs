import stripAnsi from "strip-ansi";

export function report(repositories, extra, reporter) {
    const header = reporter.header(repositories, extra);
    const repos = repositories
        .flatMap((repo) => reporter.repository(repo, extra));

    const out = `
${header}
\u0001

${repos.join('\n')}

\u0001
${header}
    `.trim();

    const lines = out.split('\n')
    const maxLength = Math.max(...lines.map((line) => stripAnsi(line).length));
    const doubleSeparator = reporter.doubleSeparator(maxLength);
    const separator = reporter.separator(maxLength);

    return lines
        .flatMap((line) => line.includes('\u0000') ? separator : line)
        .flatMap((line) => line.includes('\u0001') ? doubleSeparator : line)
        .join('\n');
}