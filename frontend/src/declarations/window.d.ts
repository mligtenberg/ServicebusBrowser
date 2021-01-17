import { ISecretService, IServicebusConnectionService } from '../../../ipcModels/services';

declare global {
  interface Window {
    secrets: ISecretService;
    servicebusConnections: IServicebusConnectionService;
  }
}
