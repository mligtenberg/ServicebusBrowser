import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Logger } from '@service-bus-browser/logs-services';
import { Problem } from '@service-bus-browser/shared-contracts';

type SaveMode = 'create' | 'update';

@Injectable({
  providedIn: 'root',
})
export class SaveFeedbackService {
  private readonly messageService = inject(MessageService);
  private readonly logger = inject(Logger);

  async run(options: {
    entityType: string;
    entityName: string;
    mode: SaveMode;
    save: () => Promise<void>;
  }): Promise<boolean> {
    const { entityType, entityName, mode, save } = options;
    const entityLabel = entityType.toLowerCase();

    this.logger.info(
      mode === 'create'
        ? `Creating ${entityLabel} ${entityName}`
        : `Saving ${entityLabel} ${entityName}`,
    );

    try {
      await save();

      const successMessage = `${entityType} ${entityName} ${
        mode === 'create' ? 'created' : 'updated'
      } successfully`;

      this.logger.info(successMessage);
      this.messageService.add({
        severity: 'success',
        summary: mode === 'create' ? `${entityType} created` : `${entityType} updated`,
        detail: successMessage,
      });

      return true;
    } catch (error) {
      const errorDetail = this.getErrorDetail(error);

      this.logger.error(
        `Failed to ${mode === 'create' ? 'create' : 'save'} ${entityLabel} ${entityName}: ${errorDetail}`,
        error,
      );
      this.messageService.add({
        severity: 'error',
        summary:
          mode === 'create'
            ? `Failed to create ${entityLabel}`
            : `Failed to save ${entityLabel}`,
        detail: errorDetail,
      });

      return false;
    }
  }

  private getErrorDetail(error: unknown): string {
    if (this.isProblem(error)) {
      return error.detail || error.title;
    }

    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'object' && error !== null) {
      const candidate = error as Partial<Problem> & { message?: string };
      return candidate.detail || candidate.title || candidate.message || 'Unknown error';
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'Unknown error';
  }

  private isProblem(error: unknown): error is Problem {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    return 'title' in error || 'detail' in error;
  }
}
