/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
import { Server } from '@service-bus-browser/service-bus-server';
import { ConnectionManager } from '@service-bus-browser/service-bus-clients';
import { ReadonlyConfigFileConnectionStorage } from './readonly-config-file-connection-store';

const serviceBusBrowserServer = new Server(
  new ConnectionManager(new ReadonlyConfigFileConnectionStorage())
);

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.post('/api/messages/command', (req, res) => {
  const request: { requestType: string, body: unknown } = req.body;

  res.send(serviceBusBrowserServer.messagesExecute(request.requestType, request.body));
});

app.post('/api/management/command', (req, res) => {
  const request: { requestType: string, body: unknown } = req.body;

  res.send(serviceBusBrowserServer.managementExecute(request.requestType, request.body));
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
