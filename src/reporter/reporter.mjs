import stripAnsi from "strip-ansi";

export function report(repositories, extra, reporter) {
    const header = reporter.header(repositories, extra);
    const repos = repositories
        .flatMap((repo) => reporter.repository(repo, extra));

    const out = `
${repos.join('\n')}

\u0001
${header}
    `.trim();

    const lines = out.split('\n')
    const maxLength = Math.max(...lines.map((line) => stripAnsi(line).length));
    const doubleSeparator = reporter.doubleSeparator(maxLength);
    const separator = reporter.separator(maxLength);

    return lines
        .map((line) => line.replace('\u0000', separator))
        .map((line) => line.replace('\u0001', doubleSeparator))
        .join('\n');
}