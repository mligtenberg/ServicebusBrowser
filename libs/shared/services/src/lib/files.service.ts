import { inject, Injectable } from '@angular/core';
import { ServiceBusMessagesFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  electronClient = inject(ServiceBusMessagesFrontendClient);

  async saveFile(
    fileName: string,
    content: string | Uint8Array,
    fileTypes: Array<{ extensions: string[]; name: string }>
  ) {
    if ('electron' in window) {
      // Electron is available, use the electron client
      await this.electronClient.saveFile(fileName, content, fileTypes);
      return;
    }

    const blob = new Blob([content], { type: 'application/octet-stream' });

    saveAs(blob, fileName);
  }

  openFile(
    fileTypes: Array<{ extensions: string[]; name: string }>,
    type: 'binary'
  ): Promise<{ fileName: string, contents: ArrayBuffer}>;
  openFile(
    fileTypes: Array<{ extensions: string[]; name: string }>,
    type: 'text'
  ): Promise<{ fileName: string, contents: string}>;
  openFile(
    fileTypes: Array<{ extensions: string[]; name: string }>,
    type: 'text' | 'binary'
  ): Promise<{ fileName: string, contents: string | ArrayBuffer}> {
    return new Promise<{ fileName: string, contents: string | ArrayBuffer}>((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.style.display = 'none';
      input.accept = fileTypes.map((ft) => `.${ft.extensions.join(', .')}`).join(', ');

      input.addEventListener('change', () => {
        if (input.files && input.files.length > 0) {
          const file = input.files[0];
          const reader = new FileReader();

          reader.onload = (e) => {
            if (!e.target || !e.target.result) {
              reject(new Error('Failed to read file'));
              return;
            }

            resolve({ fileName: file.name, contents: e.target.result as string | ArrayBuffer });
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
