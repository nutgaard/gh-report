import Server from './server/server.mjs';

const server = new Server();

server.serveStatic('/', '/src/public');

server.start(31337);
