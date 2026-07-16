import { type Meta, type StoryObj } from '@storybook/angular';
import { expect, waitFor, within } from 'storybook/test';
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText(/Sequence ID: 0\./)).toBeInTheDocument());
    // Index 92 is well past the initial render window + CDK's buffer, so it
    // must not exist in the DOM until we actually scroll to it.
    expect(canvas.queryByText(/Sequence ID: 92\./)).not.toBeInTheDocument();

    const viewport = canvasElement.querySelector('.cdk-virtual-scroll-viewport') as HTMLElement;
    viewport.scrollTop = 92 * 24;
    viewport.dispatchEvent(new Event('scroll'));

    const scrolledLine = await waitFor(() => canvas.getByText(/Sequence ID: 92\./));
    // `[appendOnly]="true"` on `sbb-virtual-scroller` (logs-list.component.html)
    // deliberately keeps earlier rows in the DOM (scrollback stays selectable),
    // rather than recycling them like a plain virtual-scroll viewport — so row
    // 0 is still expected to be present here.
    expect(canvas.getByText(/Sequence ID: 0\./)).toBeInTheDocument();
    // 92 % 5 === 2 -> 'error' severity -> logLineColor() maps it to --sbb-danger.
    expect(scrolledLine.style.getPropertyValue('--color')).toBe('var(--sbb-danger)');
  },
};

export const LotsOfMessages: Story = {
  args: {
    logs: generateFakeLogs(100000),
  },
};
