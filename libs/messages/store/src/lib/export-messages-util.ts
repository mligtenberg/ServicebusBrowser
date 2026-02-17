import {
  MessageFilter,
  sequenceNumberToKey,
  ServiceBusReceivedMessage,
} from '@service-bus-browser/messages-contracts';
import { getMessagesRepository } from '@service-bus-browser/messages-db';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ZipReader, ZipWriter } from '@zip.js/zip.js';
import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TasksActions } from '@service-bus-browser/tasks-store';
import { FilesService } from '@service-bus-browser/services';
import { messagesImported } from './messages.internal-actions';

const repository = await getMessagesRepository();

@Injectable({
  providedIn: 'root',
})
export class ExportMessagesUtil {
  store = inject(Store);
  fileService = inject(FilesService);

  public async exportMessages(
    pageId: UUID,
    filter?: MessageFilter,
    selection?: string[],
  ) {
    const count = await repository.countMessages(pageId, filter, selection);

    const taskId = crypto.randomUUID();
    const page = await repository.getPage(pageId);

    this.store.dispatch(
      TasksActions.createTask({
        id: taskId,
        description: `exporting: ${page?.name}`,
        hasProgress: true,
        initialProgress: 0,
        statusDescription: `0/${count}`,
      }),
    );

    const filePickerSupported =
      ('showSaveFilePicker' in window) &&
      typeof window.showSaveFilePicker === 'function';

    let writableStream: WritableStream;
    let blobPromise: Promise<Blob> | undefined = undefined;

    if (filePickerSupported)  {
      const handle = (await (window as any).showSaveFilePicker({
        suggestedName: `${page.name}.zip`,
        types: [
          {
            description: 'Messages archive',
            accept: { 'application/zip': ['.zip'] },
          },
        ],
      })) as FileSystemFileHandle;
      writableStream = await handle.createWritable();
    } else {
      const transformStream = new TransformStream();
      writableStream = transformStream.writable;
      const response = new Response(transformStream.readable);
      blobPromise = response.blob();

    }

    const zip = new ZipWriter(writableStream);

    await repository.walkMessagesWithCallback(
      pageId,
      (message, index) => {
        const messageFolder = `message${index}_${message.messageId}`;
        zip.add(`${messageFolder}`, undefined, {
          directory: true,
        });

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

        const bodyStream = new Blob([body]).stream();
        zip.add(`${messageFolder}/body.txt`, bodyStream);

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
          applicationProperties: message.applicationProperties || {},
        };

        const propertiesStream = new Blob([
          JSON.stringify(properties, null, 2),
        ]).stream();
        zip.add(`${messageFolder}/properties.json`, propertiesStream);

        if (index % 100 === 0) {
          this.store.dispatch(
            TasksActions.setProgress({
              id: taskId,
              statusDescription: `${index + 1}/${count}`,
              progress: ((index + 1) / count) * 100,
            }),
          );
        }
      },
      filter,
      undefined,
      undefined,
      true,
      selection,
    );

    this.store.dispatch(
      TasksActions.setProgress({
        id: taskId,
        statusDescription: 'Finalizing export',
        progress: 100,
      }),
    );

    await zip.close();

    if (blobPromise) {
      const blob = await blobPromise;
      await this.fileService.saveFile(`${page.name}.zip`, blob, [
        {
          name: 'application/zip',
          extensions: ['.zip'],
        }
      ]);
    }

    this.store.dispatch(TasksActions.completeTask({ id: taskId }));
  }

  public async importMessages() {
    try {
      const taskId = crypto.randomUUID();

      const pickerSupported =
        'showOpenFilePicker' in window &&
        typeof (window as any).showOpenFilePicker === 'function';

      let fileName: string;
      let readStream: ReadableStream;

      if (pickerSupported) {
        const [handle] = (await (window as any).showOpenFilePicker({
          multiple: false,
          types: [
            {
              description: 'Messages archive',
              accept: { 'application/zip': ['.zip'] },
            },
          ],
          excludeAcceptAllOption: false,
        })) as FileSystemFileHandle[];

        fileName = handle.name;
        readStream = await handle.getFile().then((file) => file.stream());
      } else {
        const fallback = await this.fileService.openFile(
          [{ name: 'Messages archive', extensions: ['zip'] }],
          'binary',
        );
        fileName = fallback.fileName;
        const contents = fallback.contents;
        readStream = new Blob([contents]).stream();
      }

      const pageName = "imported: " + fileName.replace(/\.zip$/i, '');
      const pageId = crypto.randomUUID();

      await repository.addPage({
        id: pageId,
        name: pageName,
        retrievedAt: new Date(),
      });

      const zip = new ZipReader(readStream);
      const entries = await zip.getEntries();
      const dirs = entries.filter((entry) => entry.directory);
      const totalItemCount = dirs.length;

      let processedItemCount = 0;
      let messages: ServiceBusReceivedMessage[] = [];

      this.store.dispatch(
        TasksActions.createTask({
          id: taskId,
          description: `importing: ${fileName}`,
          hasProgress: true,
          initialProgress: 0,
          statusDescription: `0/${totalItemCount}`,
        }),
      );
      for (const dir of dirs) {
        const bodyEntry = entries.find((entry) => entry.filename === `${dir.filename}body.txt`);
        const propertiesEntry = entries.find((entry) => entry.filename === `${dir.filename}properties.json`);

        if (!bodyEntry || !propertiesEntry || bodyEntry.directory || propertiesEntry.directory) {
          continue;
        }

        const bodyTransform = new TransformStream();
        const propertiesTransform = new TransformStream();

        const bodyBlobPromise = new Response(bodyTransform.readable).blob();
        const propertiesBlobPromise = new Response(propertiesTransform.readable).blob();

        await bodyEntry.getData(bodyTransform.writable);
        await propertiesEntry.getData(propertiesTransform.writable);

        const bodyBlob = await bodyBlobPromise;
        const propertiesBlob = await propertiesBlobPromise;

        const bodyContent = await bodyBlob.text();
        const properties = JSON.parse(await propertiesBlob.text());
        const key = sequenceNumberToKey(properties.sequenceNumber);

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
          state: 'active',
        };

        messages.push(message);

        if (messages.length >= 1000) {
          await repository.addMessages(pageId, messages);

          processedItemCount += messages.length;
          this.store.dispatch(TasksActions.setProgress({
            id: taskId,
            statusDescription: `${processedItemCount}/${totalItemCount}`,
            progress: ((processedItemCount / totalItemCount) * 100),
          }))

          messages = [];
        }
      }

      if (messages.length > 0) {
        await repository.addMessages(pageId, messages);
      }

      this.store.dispatch(TasksActions.completeTask({ id: taskId }));
      this.store.dispatch(
        messagesImported({
          pageId,
          pageName,
        }),
      );
    } catch (e) {
      console.error(e);
    }
  }
}
