import {
  MessageFilter,
} from '@service-bus-browser/filtering';
import { getMessagesRepository } from '@service-bus-browser/messages-db';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ZipReader, ZipWriter } from '@zip.js/zip.js';
import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TasksActions } from '@service-bus-browser/tasks-store';
import { FilesService } from '@service-bus-browser/services';
import { ReceivedMessage } from '@service-bus-browser/api-contracts';
import { messagePagesEffectActions } from './messages.effect-actions';

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

    const { handle, ufs: isUfs } = await this.getFileHandle(`${page.name}.zip`, [
      {
        name: 'application/zip',
        extensions: ['.zip'],
      },
      ]);
    const writableStream = await handle.createWritable();
    const zip = new ZipWriter(writableStream);

    let messages: { index: number; message: ReceivedMessage }[] = [];
    await zip.add('VERSION', new Blob(['2.0.0']).stream());

    await repository.walkMessagesWithCallback(
      pageId,
      async (message, index) => {
        messages.push({ index, message });

        if ((index + 1) % 100 === 0) {
          await Promise.all(
            messages.map(async ({ index, message }) =>
              this.addToZip(zip, index, message),
            ),
          );

          messages = [];
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

    if (messages.length > 0) {
      await Promise.all(
        messages.map(async ({ index, message }) =>
          this.addToZip(zip, index, message),
        ),
      );
    }

    this.store.dispatch(
      TasksActions.setProgress({
        id: taskId,
        statusDescription: 'Finalizing export',
        progress: 100,
      }),
    );

    await zip.close();

    if (isUfs) {
      return;
    }

    const file = await handle.getFile();
    await this.fileService.storeViaSyntaticFile(`${page.name}.zip`, file);

    this.store.dispatch(TasksActions.completeTask({ id: taskId }));
  }

  private uint8ArrayToStream(uint8: Uint8Array) {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(uint8);
        controller.close();
      },
    });
  }

  private async addToZip(
    zip: ZipWriter<unknown>,
    index: number,
    message: ReceivedMessage,
  ) {
    const messageFolder = `message${index}_${message.messageId}`;
    await zip.add(`${messageFolder}`, undefined, {
      directory: true,
    });

    await zip.add(
      `${messageFolder}/body.txt`,
      this.uint8ArrayToStream(message.body),
    );
    const properties = {
      key: message.key,
      messageId: message.messageId,
      sequence: message.sequence,
      contentType: message.contentType,
      systemProperties: message.systemProperties || {},
      applicationProperties: message.applicationProperties || {},
    };

    const propertiesStream = new Blob([
      JSON.stringify(properties, null, 2),
    ]).stream();
    await zip.add(`${messageFolder}/properties.json`, propertiesStream);
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

      const pageName = 'imported: ' + fileName.replace(/\.zip$/i, '');
      const pageId = crypto.randomUUID();

      await repository.addPage({
        id: pageId,
        name: pageName,
        retrievedAt: new Date(),
      });

      this.store.dispatch(
        messagePagesEffectActions.pageCreated({
          pageId,
          pageName,
          disabled: true,
        }),
      );

      const zip = new ZipReader(readStream);
      const entries = await zip.getEntries();
      const versionEntry = entries.find(
        (entry) => entry.filename === 'VERSION',
      );

      // we currently only have 2 versions of the archive, version 1.0.0 does not have a VERSION file, and version 2.0.0 has a VERSION file
      const version =
        versionEntry && !versionEntry.directory ? '2.0.0' : '1.0.0';

      const dirs = entries.filter((entry) => entry.directory);
      const totalItemCount = dirs.length;

      let processedItemCount = 0;
      let messages: ReceivedMessage[] = [];

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
        const bodyEntry = entries.find(
          (entry) => entry.filename === `${dir.filename}body.txt`,
        );
        const propertiesEntry = entries.find(
          (entry) => entry.filename === `${dir.filename}properties.json`,
        );

        if (
          !bodyEntry ||
          !propertiesEntry ||
          bodyEntry.directory ||
          propertiesEntry.directory
        ) {
          continue;
        }

        const bodyTransform = new TransformStream();
        const propertiesTransform = new TransformStream();

        const bodyBlobPromise = new Response(bodyTransform.readable).blob();
        const propertiesBlobPromise = new Response(
          propertiesTransform.readable,
        ).blob();

        await bodyEntry.getData(bodyTransform.writable);
        await propertiesEntry.getData(propertiesTransform.writable);

        const bodyBlob = await bodyBlobPromise;
        const propertiesBlob = await propertiesBlobPromise;

        const message =
          version === '1.0.0'
            ? await this.parseV1Message(bodyBlob, propertiesBlob)
            : await this.parseV2Message(bodyBlob, propertiesBlob);

        messages.push(message);

        if (messages.length >= 1000) {
          await repository.addMessages(pageId, messages);

          processedItemCount += messages.length;
          this.store.dispatch(
            TasksActions.setProgress({
              id: taskId,
              statusDescription: `${processedItemCount}/${totalItemCount}`,
              progress: (processedItemCount / totalItemCount) * 100,
            }),
          );

          messages = [];
        }
      }

      if (messages.length > 0) {
        await repository.addMessages(pageId, messages);
      }

      this.store.dispatch(TasksActions.completeTask({ id: taskId }));
      this.store.dispatch(
        messagePagesEffectActions.pageLoaded({
          pageId,
          endpoint: null,
        }),
      );
    } catch (e) {
      console.error(e);
    }
  }

  private async parseV1Message(bodyBlob: Blob, propertiesBlob: Blob) {
    const bodyContent = await bodyBlob
      .arrayBuffer()
      .then((buffer) => new Uint8Array(buffer));

    const properties = JSON.parse(await propertiesBlob.text());
    const key =
      Array.from({ length: 20 - properties.sequenceNumber.length })
        .map(() => '0')
        .join() + properties.sequenceNumber;

    return {
      key: key,
      body: bodyContent,
      messageId: properties.messageId,
      sequence: properties.sequenceNumber,
      systemProperties: {
        subject: properties.subject,
        correlationId: properties.correlationId,
        contentType: properties.contentType,
        enqueuedTimeUtc: properties.enqueuedTimeUtc,
        timeToLive: properties.timeToLive,
        to: properties.to,
        enqueuedSequenceNumber: properties.enqueuedSequenceNumber,
        state: 'active',
      },
      applicationProperties: properties.applicationProperties || {},
    } as ReceivedMessage;
  }

  private async parseV2Message(bodyBlob: Blob, propertiesBlob: Blob) {
    const bodyContent = await bodyBlob
      .arrayBuffer()
      .then((buffer) => new Uint8Array(buffer));

    const properties = JSON.parse(await propertiesBlob.text());

    return {
      key: properties.key,
      body: bodyContent,
      messageId: properties.messageId,
      sequence: properties.sequence,
      systemProperties: properties.systemProperties || {},
      applicationProperties: properties.applicationProperties || {},
    } as ReceivedMessage;
  }

  private async getFileHandle(
    fileName: string,
    fileTypes: Array<{ extensions: string[]; name: string }>,
  ) {
    const pickerSupported =
      'showSaveFilePicker' in window &&
      typeof (window as any).showSaveFilePicker === 'function';

    if (pickerSupported) {
      const handle = (await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: fileTypes,
      })) as FileSystemFileHandle;

      return { handle, ufs: true }
    }

    const opfsRoot = await navigator.storage.getDirectory();
    const sqliteRoot = await opfsRoot.getDirectoryHandle('exports', {
      create: true,
    });
    const opfsHandle = await sqliteRoot.getFileHandle(fileName, { create: true });
    return { handle: opfsHandle, ufs: false };
  }
}
