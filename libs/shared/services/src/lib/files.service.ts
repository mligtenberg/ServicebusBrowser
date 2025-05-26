import { inject, Injectable } from '@angular/core';
import { ServiceBusMessagesElectronClient } from '@service-bus-browser/service-bus-electron-client';

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  electronClient = inject(ServiceBusMessagesElectronClient);

  async saveFile(fileName: string, content: string, fileTypes: Array<{extensions: string[]; name: string;}>) {
    await this.electronClient.saveFile(fileName, content, fileTypes);
  }

  async openFile(fileName: string, fileTypes: Array<{extensions: string[]; name: string;}>) {
    return await this.electronClient.openFile(fileName, fileTypes)
  }
}
