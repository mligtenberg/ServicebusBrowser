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
      return;
    }

    const blob = new Blob([content], { type: 'application/octet-stream' });

    saveAs(blob, fileName);
  }

  openFile(fileName: string, fileTypes: Array<{extensions: string[]; name: string;}>, type: 'binary'): Promise<ArrayBuffer>
  openFile(fileName: string, fileTypes: Array<{extensions: string[]; name: string;}>, type: 'text'): Promise<string>
  openFile(fileName: string, fileTypes: Array<{extensions: string[]; name: string;}>, type: 'text' | 'binary'): Promise<string | ArrayBuffer> {
   // return await this.electronClient.openFile(fileName, fileTypes);
    return new Promise<string | ArrayBuffer>((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.style.display = 'none';

      input.addEventListener('change', () => {
        if (input.files && input.files.length > 0) {
          const file = input.files[0];
          const reader = new FileReader();

          reader.onload = (e) => {
            if (!e.target || !e.target.result) {
              reject(new Error('Failed to read file'));
              return;
            }

            resolve(e.target.result);
          };

          reader.onerror = (err) => {
            reject(err);
          };

          if (type === 'binary') {
            reader.readAsArrayBuffer(file);
          } else if (type === 'text') {
            reader.readAsText(file);
          }
        } else {
          reject(new Error('No file selected'));
        }
        document.body.removeChild(input); // Clean up
      });

      document.body.appendChild(input);
      input.click();
    });
  }
}
