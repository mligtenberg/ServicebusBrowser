import { ServiceBusReceivedMessage } from '@service-bus-browser/messages-contracts';
import JSZip from 'jszip';

export async function makeZipFile(messages: ServiceBusReceivedMessage[]): Promise<BlobPart> {
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
  return await zip.generateAsync({ type: 'arraybuffer' });
}
