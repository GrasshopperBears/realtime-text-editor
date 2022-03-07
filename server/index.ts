import Koa from 'koa';
import Router from 'koa-router';
import http from 'http';
import cors from '@koa/cors';
import { Server } from 'socket.io';

import changeHandler from './change-handler';

const clientHost = 'http://localhost:3000';

const app = new Koa();
const router = new Router();
const server = http.createServer(app.callback());
const io = new Server(server, { cors: { origin: clientHost } });

router.get('/', (ctx, next) => {
  next();
});

app.use(cors({ origin: clientHost }));
app.use(router.routes()).use(router.allowedMethods());

io.on('connect', (socket) => {
  console.log(`client connected: ${socket.id}`);

  socket.on('change', (data) => {
    changeHandler(socket, data);
  });
});

server.listen(4000);
console.log('server running');
