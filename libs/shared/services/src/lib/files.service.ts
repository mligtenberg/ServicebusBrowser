import { inject, Injectable } from '@angular/core';
import { ServiceBusMessagesFrontendClient } from '@service-bus-browser/service-bus-electron-client';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  electronClient = inject(ServiceBusMessagesFrontendClient);

  async saveFile(fileName: string, content: string | Uint8Array, fileTypes: Array<{extensions: string[]; name: string;}>) {
    if ('electron' in window) {
      // Electron is available, use the electron client
      await this.electronClient.saveFile(fileName, content, fileTypes);
    }

    const blob = new Blob([content], { type: 'application/octet-stream' });

    saveAs(blob, fileName);
  }

  async openFile(fileName: string, fileTypes: Array<{extensions: string[]; name: string;}>) {
    return await this.electronClient.openFile(fileName, fileTypes);
  }
}
