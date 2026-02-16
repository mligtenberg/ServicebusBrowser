import { MessageFilter } from '@service-bus-browser/messages-contracts';
import { getMessagesRepository } from '@service-bus-browser/messages-db';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ZipWriter } from '@zip.js/zip.js';
import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TasksActions } from '@service-bus-browser/tasks-store';
import { FilesService } from '@service-bus-browser/services';

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
      !('showSaveFilePicker' in window) ||
      typeof window.showSaveFilePicker !== 'function';

    let writableStream: WritableStream;
    let blobPromise: Promise<Blob> | undefined = undefined;

    if (filePickerSupported) {
      const transformStream = new TransformStream();
      writableStream = transformStream.writable;
      const response = new Response(transformStream.readable);
      blobPromise = response.blob();

    } else {
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

        this.store.dispatch(
          TasksActions.setProgress({
            id: taskId,
            statusDescription: `${index + 1}/${count}`,
            progress: ((index + 1) / count) * 100,
          }),
        );
      },
      filter,
      undefined,
      undefined,
      true,
      selection,
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
}
