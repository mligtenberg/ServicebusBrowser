import { Page } from './models/page';
import { UUID } from '@service-bus-browser/shared-contracts';

export type PagesDatabase = {
  initialize(workspaceId: UUID): Promise<void>;
  addPage(page: Page): Promise<void>;
  getPages(): Promise<Page[]>;
  getPage(id: UUID): Promise<Page | undefined>;
  updatePageName(id: UUID, name: string): Promise<void>;
  closePage(id: UUID): Promise<void>;
  countPagesByWorkspace(workspaceId: UUID): Promise<number>;
  deletePagesByWorkspace(workspaceId: UUID): Promise<void>;
}
