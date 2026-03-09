import { UUID } from '@service-bus-browser/shared-contracts';
import { Page } from './models/page';
import { PagesDatabase } from './pages-database';
import { Database } from './sqllite/database';
import { ensurePagesDbCreated } from './sqllite/ensure-messages-db-created';

export class SqlitePagesDatabase implements PagesDatabase {
  database: Database = new Database('pages');

  async initialize(): Promise<void> {
    await this.database.initialize();
    await ensurePagesDbCreated(this.database);
  }

  async addPage(page: Page): Promise<void> {
    await this.database.exec(
      `INSERT INTO pages (id, name, retrievedAt) VALUES (?, ?, ?)`,
      [page.id, page.name, page.retrievedAt],
    );
  }

  async getPages(): Promise<Page[]> {
    const rows = await this.selectRows<Page>(
      'SELECT * FROM pages ORDER BY retrievedAt ASC',
    );
    return rows;
  }

  async getPage(id: UUID): Promise<Page | undefined> {
    const rows = await this.selectRows<Page>(
      'SELECT * FROM pages WHERE id = ? LIMIT 1',
      [id],
    );
    return rows[0];
  }

  async updatePageName(id: UUID, name: string): Promise<void> {
    await this.database.exec(
      `UPDATE pages SET name = ? WHERE id = ?`,
      [name, id],
    );
  }

  async closePage(id: UUID): Promise<void> {
    await this.database.exec(
      `DELETE FROM pages WHERE id = ?`,
      [id],
    );
  }

  private async selectRows<T>(sql: string, args: unknown[] = []): Promise<T[]> {
    const response = await this.database.exec(sql, args);
    const responseAsRecord = response as {
      result?: { resultRows?: unknown[] };
      resultRows?: unknown[];
    };

    const rows =
      responseAsRecord.result?.resultRows ?? responseAsRecord.resultRows;
    return (rows ?? []) as T[];
  }
}
