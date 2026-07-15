import { type Meta, type StoryObj } from '@storybook/angular';
import { LogsListComponent } from './logs-list.component';
import { LogLine } from '@service-bus-browser/logs-contracts';

const meta: Meta<LogsListComponent> = {
  title: 'Logs/LogsList',
  component: LogsListComponent,
};

export default meta;
type Story = StoryObj<LogsListComponent>;

const generateFakeLogs = (count: number): LogLine[] => {
  const severities: ('info' | 'warn' | 'error' | 'verbose' | 'critical')[] = ['info', 'warn', 'error', 'verbose', 'critical'];
  const logs: LogLine[] = [];
  for (let i = 0; i < count; i++) {
    logs.push({
      message: `This is a generated fake log message for testing purposes. Sequence ID: ${i}. It can be long enough to test how the layout handles larger text content within the grid.`,
      severity: severities[i % severities.length],
      loggedAt: new Date(Date.now() - (count - i) * 1000),
      context: { source: 'StorybookDataGenerator' },
    });
  }
  return logs;
};

export const Default: Story = {
  args: {
    logs: generateFakeLogs(100),
  },
};

export const LotsOfMessages: Story = {
  args: {
    logs: generateFakeLogs(100000),
  },
};
