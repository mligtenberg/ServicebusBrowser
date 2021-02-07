import { IConnection } from 'src/app/connections/ngrx/connections.models';
import { ISecretService } from '../../../ipcModels/services';

declare global {
  interface Window {
    secrets: ISecretService;
    servicebusConnections: {
      getClient(connection: IConnection): any;
      getAdminClient(connection: IConnection): any;
    };
  }
}
