import { ServiceBusReceivedMessage } from '@service-bus-browser/messages-contracts';
import { dialog } from 'electron';
import * as fs from 'fs';
import JSZip from 'jszip';

export const exportMessages = async (body: { pageName: string, messages: ServiceBusReceivedMessage[] }) => {
  const { pageName, messages } = body;

  // Generate a safe filename from the page name
  const safeName = pageName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const defaultFileName = `${safeName}_${timestamp}.zip`;

  // Show save dialog to let user choose where to save the zip
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Export Messages',
    defaultPath: defaultFileName,
    filters: [
      { name: 'Zip files', extensions: ['zip'] }
    ]
  });

  if (canceled || !filePath) {
    return;
  }

  // Create zip file
  const zip = new JSZip();

  // Add each message to the zip
  for (let index = 0; index < messages.length; index++) {
    const message = messages[index];

    // Create a directory for each message
    const messageFolder = zip.folder(`message${index}_${message.messageId}`);
    if (!messageFolder) continue;

    // Add message body
    let body = '';
    if (typeof message.body === 'string') {
      body = message.body;
    } else if (message.body) {
      try {
        body = JSON.stringify(message.body, null, 2);
      } catch {
        body = String(message.body);
      }
    }

    messageFolder.file('body.txt', body);

    // Add properties file
    const properties = {
      messageId: message.messageId,
      sequenceNumber: message.sequenceNumber,
      subject: message.subject,
      correlationId: message.correlationId,
      contentType: message.contentType,
      enqueuedTimeUtc: message.enqueuedTimeUtc,
      timeToLive: message.timeToLive,
      to: message.to,
      enqueuedSequenceNumber: message.enqueuedSequenceNumber,
      applicationProperties: message.applicationProperties || {}
    };

    messageFolder.file('properties.json', JSON.stringify(properties, null, 2));
  }

  // Generate the zip file
  const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

  // Write the zip file to disk
  fs.writeFileSync(filePath, zipContent);

  return true;
};
