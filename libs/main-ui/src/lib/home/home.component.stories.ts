import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig } from '@storybook/angular-vite';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { WorkspaceService } from '@service-bus-browser/services';
import { HomeComponent } from './home.component';
import { selectRecentPages } from '../ngrx/recent-pages.selectors';
import { RecentPageItem } from '../ngrx/recent-pages.model';

const WORKSPACE_ID = '11111111-1111-1111-1111-111111111111';

const manyRecentPages: RecentPageItem[] = [
  {
    title: 'View Messages: primary-connection/orders-queue',
    url: `/${WORKSPACE_ID}/messages/page/11111111-1111-1111-1111-111111111111`,
    visitedAt: 1755000000000,
  },
  {
    title: 'Edit Queue: orders',
    url: `/${WORKSPACE_ID}/manage-service-bus/connections/1/queues/edit/orders`,
    visitedAt: 1755000001000,
  },
  {
    title: 'Edit Topic: order-events',
    url: `/${WORKSPACE_ID}/manage-service-bus/connections/1/topics/edit/order-events`,
    visitedAt: 1755000002000,
  },
];

const workspaceServiceStub: Pick<WorkspaceService, 'workspaceUrl'> = {
  workspaceUrl: (path: string) =>
    `/${WORKSPACE_ID}${path.startsWith('/') ? path : `/${path}`}`,
};

/**
 * `HomeComponent` is store/router-connected, so unlike the presentational
 * `shared-ui` stories, this one mocks the store and router via
 * `applicationConfig` rather than just binding template inputs.
 */
const meta: Meta<HomeComponent> = {
  title: 'Main UI/Home',
  component: HomeComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([]),
        provideMockStore({
          selectors: [{ selector: selectRecentPages, value: manyRecentPages }],
        }),
        { provide: WorkspaceService, useValue: workspaceServiceStub },
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<HomeComponent>;

export const WithRecentPages: Story = {};

export const Empty: Story = {
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([]),
        provideMockStore({ selectors: [{ selector: selectRecentPages, value: [] }] }),
      ],
    }),
  ],
};

export const WithoutQuickActions: Story = {
  args: { showQuickActions: false },
};
