interface ConnectionBase {
  type: string;
  name: string;
}

interface ConnectionStringConnection extends ConnectionBase {
  type: 'connectionString';
  connectionString: string;
}

export type Connection = ConnectionStringConnection;
