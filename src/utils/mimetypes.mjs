import mimetypes from 'mime-db';
import path from 'path';

const extlookupArray = Object.entries(mimetypes)
    .flatMap(([type, description]) => {
        const ext = description.extensions ?? [];
        return ext.map((e) => [e, type]);
    });

const extlookup = Object.fromEntries(extlookupArray);

export function resolve(filename) {
    let extension = path.extname(filename);
    if (extension.startsWith('.')) {
        extension = extension.substr(1);
    }
    return extlookup[extension] ?? 'text/plain';
}