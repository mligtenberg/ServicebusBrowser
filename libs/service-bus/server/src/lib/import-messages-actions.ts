import { ServiceBusReceivedMessage } from '@service-bus-browser/messages-contracts';
import { dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import JSZip from 'jszip';

export const importMessages = async () => {
  // Show open dialog to let user choose a zip file to import
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Import Messages',
    filters: [
      { name: 'Zip files', extensions: ['zip'] }
    ],
    properties: ['openFile']
  });

  if (canceled || !filePaths || filePaths.length === 0) {
    return { pageName: '', messages: [] };
  }

  const filePath = filePaths[0];

  // Extract filename to use as page name
  const fileName = path.basename(filePath, '.zip');

  try {
    // Read the zip file
    const zipContent = fs.readFileSync(filePath);

    // Load the zip file
    const zip = await JSZip.loadAsync(zipContent);

    // Array to store imported messages
    const messages: ServiceBusReceivedMessage[] = [];

    // Process each folder in the zip file (each message is in a separate folder)
    const messageFolders = Object.keys(zip.files).filter(key =>
      key.endsWith('/') && key.split('/').length === 2
    );

    // Process each message folder
    for (const folderPath of messageFolders) {
      // Process body.txt
      const bodyFile = zip.file(`${folderPath}body.txt`);
      const propertiesFile = zip.file(`${folderPath}properties.json`);

      if (!bodyFile || !propertiesFile) continue;

      // Read body content
      const bodyContent = await bodyFile.async('string');

      // Read properties
      const propertiesContent = await propertiesFile.async('string');
      const properties = JSON.parse(propertiesContent);

      // Create message object
      const message: ServiceBusReceivedMessage = {
        body: bodyContent,
        messageId: properties.messageId,
        sequenceNumber: properties.sequenceNumber,
        subject: properties.subject,
        correlationId: properties.correlationId,
        contentType: properties.contentType,
        enqueuedTimeUtc: properties.enqueuedTimeUtc,
        timeToLive: properties.timeToLive,
        to: properties.to,
        enqueuedSequenceNumber: properties.enqueuedSequenceNumber,
        applicationProperties: properties.applicationProperties || {},
        state: 'active'
      };

      messages.push(message);
    }

    return {
      pageName: fileName,
      messages
    };
  } catch (error) {
    console.error('Error importing messages:', error);
    throw error;
  }
};
