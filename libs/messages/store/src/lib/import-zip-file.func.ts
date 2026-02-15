import JSZip from 'jszip';
import { ServiceBusReceivedMessage } from '@service-bus-browser/messages-contracts';

export async function importZipFile(content: ArrayBuffer) {
  // Load the zip file
  const zip = await JSZip.loadAsync(content);

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

    // the max sequenc number of a long is 19 digits long
    const prefixAmount = 20 - properties.sequenceNumber.length;
    let key = "";
    for (let i = 0; i < prefixAmount; i++) {
      key += "0";
    }
    key += properties.sequenceNumber;

    // Create message object
    const message: ServiceBusReceivedMessage = {
      key: key,
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

  return messages;
}
