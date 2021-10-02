import emojiStrip from "emoji-strip";

const main = chalk.hex('#f43b47');
const secondary = chalk.hex('#453a94');
const accent = chalk.hex('#40943a');

export const width = 80;

function maxLength(line) {
    if (line.length < width) {
        return [line];
    }
    const lines = [];
    let currentLine = [];
    let textLength = 0;
    const words = line.split(' ');
    for (const word of words) {
        const lineLength = textLength + currentLine.length - 1;
        if (lineLength + word.length > width) {
            lines.push(currentLine.join(' '));
            currentLine = [];
            textLength = 0;
        } else {
            currentLine.push(word);
            textLength += word.length;
        }
    }
    if (currentLine.length > 0) {
        lines.push(currentLine.join(' '));
    }
    return lines;
}

function createPREntry(pr) {
    const out = [];
    out.push(`* ${emojiStrip(pr.title)} (${secondary(pr.author)})`);
    if (pr.bodyText.length > 0) {
        emojiStrip(pr.bodyText)
            .split('\n')
            .filter((line) => line.length > 0)
            .flatMap((line) => maxLength(line))
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
    name: 'terminal',
    header(repositories, extra) {
        return secondary(`${formatter.format(new Date(extra.since))} - ${formatter.format(new Date())}`);
    },
    separator(width) {
        return new Array(width).fill('-').join('')
    },
    doubleSeparator(width) {
        return new Array(width).fill('=').join('');
    },
    repository(repository, extra) {
        const master = repository.master;
        const dev = repository.dev;
        const changes = master.length + dev.length;
        if (changes === 0) return [];

        const header = `${main(repository.name)} (${accent(master.length)} / ${secondary(dev.length)}) `

        const masterPRs = master
            .flatMap(createPREntry)
            .map((line) => '    ' + line);
        const devPRs = dev
            .flatMap(createPREntry)
            .map((line) => '    ' + line);

        const masterLines = masterPRs.length === 0 ? [] : [
            `  ${main('master: ')}`,
            ...masterPRs,
        ]
        const devLines = devPRs.length === 0 ? [] : [
            `  ${main('dev: ')}`,
            ...devPRs,
        ]

        return [
            header,
            chalk.cyan('\u0000'),
            ...masterLines,
            ...devLines,
            '',
        ];
    }
}