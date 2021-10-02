import http from 'http';
import fs from 'fs';
import path from 'path'
import * as Mimetypes from '../utils/mimetypes.mjs';

export default class Server {
    __handlers = [];
    __server = undefined;

    start(port) {
        this.__server = http.createServer((req, res) => {
            const url = Server.getUrl(req);
            const match = this.__handlers
                .find(({ handlerUrl }) => this.matches(handlerUrl, url));
            if (!match) {
                res.writeHead(404, 'File not found');
                res.end();
            } else {
                const { handlerUrl, handler } = match;
                const result = handler(req);
                const { code, status, content, mimetype } = result;

                res.writeHead(code, status ?? 'Ok', {
                    'Content-Type': mimetype ?? 'text/plain',
                    'Content-Length': Buffer.byteLength(content ?? '', 'utf8')
                });
                res.write(content ?? '');
                res.end();
            }
        });
        this.__server.listen(port, () => {
            console.log(`Server started at http://localhost:${port}`)
        });
    }

    get(handlerUrl, handler) {
        this.__handlers.push({
            handlerUrl,
            handler
        });
    }

    matches(handlerUrl, url) {
        return url.startsWith(handlerUrl);
    }

    serveStatic(url, directory) {
        this.__handlers.push({
            handlerUrl: url,
            handler: (req) => {
                const reqUrl = Server.getUrl(req).substr(url.length);
                const file = path.join(process.cwd(), directory, reqUrl);
                if (!fs.existsSync(file)) {
                    return { code: 404, status: 'File not found' };
                } else if (fs.statSync(file).isDirectory()) {
                    const index = path.join(file, 'index.html');
                    if (!fs.existsSync(index)) {
                        return { code: 404, status: 'File not found' };
                    } else {
                        const mimetype = Mimetypes.resolve(index);
                        const content = fs.readFileSync(path.join(file, 'index.html'));
                        return { code: 200, content, mimetype };
                    }
                } else {
                    const mimetype = Mimetypes.resolve(file);
                    const content = fs.readFileSync(file);
                    return { code: 200, content, mimetype };
                }
            }
        });
    }

    static getUrl(req) {
        let url = req.url ?? '/';
        if (url === '/') {
            url = 'index.html'
        }
        if (!url.startsWith('/')) {
            url = '/' + url;
        }
        return url;
    }
}