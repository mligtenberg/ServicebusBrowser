/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
import { Server } from '@service-bus-browser/service-bus-server';
import { ConnectionManager } from '@service-bus-browser/service-bus-clients';
import { ReadonlyConfigFileConnectionStorage } from './readonly-config-file-connection-store';
import bp from 'body-parser';
import { EXPECTED_AUDIENCE, OIDC_ISSUER, validateJWT } from './validate-tokens';

const serviceBusBrowserServer = new Server(
  new ConnectionManager(new ReadonlyConfigFileConnectionStorage())
);

const app = express();

app.use(bp.json())
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api/client-config', (req, res) => {
  res.status(200).json({
    clientId: EXPECTED_AUDIENCE,
    authority: OIDC_ISSUER,
  })
});

app.post('/api/messages/command', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || !(await validateJWT(token))) {
    res.status(401).send('Unauthorized');
    return;
  }

  const request: { requestType: string, body: unknown } = req.body;

  const result = await serviceBusBrowserServer.messagesExecute(request.requestType, request.body);
  if (result instanceof Blob) {
    res.setHeader('Content-Type', result.type);
    res.send(result);
  }
  else {
    res.send(result);
  }
});

app.post('/api/management/command', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || !(await validateJWT(token))) {
    res.status(401).send('Unauthorized');
    return;
  }

  const request: { requestType: string, body: unknown } = req.body;

  const result = await serviceBusBrowserServer.managementExecute(request.requestType, request.body);
  if (result instanceof Blob) {
    result.arrayBuffer().then((buffer) => {
      res.setHeader('Content-Type', result.type);
      res.setHeader('Content-Length', buffer.byteLength);
      res.send(Buffer.from(buffer));
    });
  }
  else {
    res.send(result);
  }
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
