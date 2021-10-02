export function replaceVars(template, values) {
    const vars = Object.keys(values).join('|');
    const pattern = new RegExp(`\\{\\{\\s?(${vars})\\s?\\}\\}`, 'g');
    return template.replace(pattern, (_, match) => values[match]);
}