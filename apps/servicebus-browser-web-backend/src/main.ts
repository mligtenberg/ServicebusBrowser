/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
import { Server } from '@service-bus-browser/service-bus-server';
import { ReadonlyConfigFileConnectionStorage } from './readonly-config-file-connection-store';
import bp from 'body-parser';
import { getOidcConfig, validateJWT } from './validate-tokens';
import { BSON, EJSON } from 'bson';

const serviceBusBrowserServer = new Server(new ReadonlyConfigFileConnectionStorage());

const app = express();

app.use(bp.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api/client-config', async (_, res) => {
  const oidcConfig = await getOidcConfig();

  res.status(200).json(oidcConfig.clientConfig);
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
    const bsonData = BSON.serialize({ result });
    res.setHeader('Content-Type', 'application/bson');
    res.send(Buffer.from(bsonData));
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
    const bsonData = BSON.serialize({ result });
    res.setHeader('Content-Type', 'application/bson');
    res.send(Buffer.from(bsonData));
  }
});

app.post('/api/service-bus-management/command', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || !(await validateJWT(token))) {
    res.status(401).send('Unauthorized');
    return;
  }

  const request: { requestType: string; body: unknown } = req.body;

  const result = await serviceBusBrowserServer.serviceBusManagementExecute(
    request.requestType,
    request.body,
  );
  if (result instanceof Blob) {
    result.arrayBuffer().then((buffer) => {
      res.setHeader('Content-Type', result.type);
      res.setHeader('Content-Length', buffer.byteLength);
      res.send(Buffer.from(buffer));
    });
  } else {
    const bsonData = BSON.serialize({ result });
    res.setHeader('Content-Type', 'application/bson');
    res.send(Buffer.from(bsonData));
  }
});


app.post('/api/rabbitmq-management/command', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || !(await validateJWT(token))) {
    res.status(401).send('Unauthorized');
    return;
  }

  const request: { requestType: string; body: unknown } = req.body;

  const result = await serviceBusBrowserServer.rabbitmqManagementExecute(
    request.requestType,
    request.body,
  );
  if (result instanceof Blob) {
    result.arrayBuffer().then((buffer) => {
      res.setHeader('Content-Type', result.type);
      res.setHeader('Content-Length', buffer.byteLength);
      res.send(Buffer.from(buffer));
    });
  } else {
    const bsonData = BSON.serialize({ result });
    res.setHeader('Content-Type', 'application/bson');
    res.send(Buffer.from(bsonData));
  }
});


const port = 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
