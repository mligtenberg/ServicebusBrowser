import { UUID } from '@service-bus-browser/shared-contracts';

interface ConnectionBase {
  id: UUID;
  type: string;
  name: string;
}

export interface ConnectionStringConnection extends ConnectionBase {
  type: 'connectionString';
  connectionString: string;
}

export type Connection = ConnectionStringConnection;
