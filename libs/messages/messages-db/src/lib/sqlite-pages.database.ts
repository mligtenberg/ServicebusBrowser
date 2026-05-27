import { UUID } from '@service-bus-browser/shared-contracts';
import { Page } from './models/page';
import { PagesDatabase } from './pages-database';
import { Database } from './sqllite/database';
import { ensurePagesDbCreated } from './sqllite/ensure-db-created';

export class SqlitePagesDatabase implements PagesDatabase {
  database: Database = new Database('pages');

  async initialize(workspaceId: UUID): Promise<void> {
    await this.database.initialize();
    await ensurePagesDbCreated(this.database, workspaceId);
    this.workspaceId = workspaceId;
  }

  private workspaceId: UUID = '' as UUID;

  async addPage(page: Page): Promise<void> {
    await this.database.exec(
      `INSERT INTO pages (id, name, retrievedAt, workspaceId) VALUES (?, ?, ?, ?)`,
      [page.id, page.name, page.retrievedAt.toISOString(), page.workspaceId],
    );
  }

  async getPages(): Promise<Page[]> {
    const rows = await this.selectRows<[UUID, string, string, UUID]>(
      'SELECT id, name, retrievedAt, workspaceId FROM pages WHERE workspaceId = ? ORDER BY retrievedAt ASC',
      [this.workspaceId],
    );
    return rows.map(([id, name, retrievedAt, workspaceId]) => ({
      id,
      name,
      retrievedAt: new Date(retrievedAt),
      workspaceId,
    }));
  }

  async getPage(id: UUID): Promise<Page | undefined> {
    const rows = await this.selectRows<[UUID, string, string, UUID]>(
      'SELECT id, name, retrievedAt, workspaceId FROM pages WHERE id = ? LIMIT 1',
      [id],
    );
    if (!rows.length) {
      return undefined;
    }

    const [pageId, name, retrievedAt, workspaceId] = rows[0];
    return { id: pageId, name, retrievedAt: new Date(retrievedAt), workspaceId };
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

  async countPagesByWorkspace(workspaceId: UUID): Promise<number> {
    const rows = await this.selectRows<[number]>(
      'SELECT COUNT(*) FROM pages WHERE workspaceId = ?',
      [workspaceId],
    );
    return rows[0]?.[0] ?? 0;
  }

  async deletePagesByWorkspace(workspaceId: UUID): Promise<void> {
    await this.database.exec(
      `DELETE FROM pages WHERE workspaceId = ?`,
      [workspaceId],
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
