function createPREntry(pr) {
    const out = [];
    out.push(`* ${pr.title} (${pr.author})  `);
    if (pr.bodyText.length > 0) {
        pr.bodyText
            .split('\n')
            .filter((line) => line.length > 0)
            .map((line) => '  ' + line)
            .forEach((line) => out.push(line));
    }
    out.push('');
    return out;
}

const formatter = new Intl.DateTimeFormat('nb-no', {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric'
})

export default {
    name: 'markdown',
    header(repositories, extra) {
        return `${formatter.format(new Date(extra.since))} - ${formatter.format(new Date())}`;
    },
    separator(width) {
        return [];
    },
    doubleSeparator(width) {
        return ['', '---', ''];
    },
    repository(repository, extra) {
        const master = repository.master;
        const dev = repository.dev;
        const changes = master.length + dev.length;
        if (changes === 0) return [];

        const header = `# ${repository.name} (${master.length} / ${dev.length}) `

        const masterPRs = master
            .flatMap(createPREntry);
        const devPRs = dev
            .flatMap(createPREntry);


        const masterLines = masterPRs.length === 0 ? [] : [
            `## master:`,
            ...masterPRs,
        ]
        const devLines = devPRs.length === 0 ? [] : [
            `## dev:`,
            ...devPRs,
        ]


        return [
            header,
            ...masterLines,
            ...devLines,
            '',
        ];
    }
}