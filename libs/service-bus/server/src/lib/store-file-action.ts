import { dialog } from 'electron';
import * as fs from 'fs';

export const storeFile = async (body: { fileName: string, fileContent: string | Uint8Array, fileTypes: Electron.FileFilter[] }) => {
  const { fileName, fileContent, fileTypes } = body;

  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Export Messages',
    defaultPath: fileName,
    filters: fileTypes
  });

  if (canceled) {
    return false;
  }

  fs.writeFileSync(filePath, fileContent);

  return true;
}

