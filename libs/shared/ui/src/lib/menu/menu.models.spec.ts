import { isSbbMenuSeparator, SbbMenuItem } from './menu.models';

describe('SbbMenuItem model', () => {
  it('recognises separator entries', () => {
    expect(isSbbMenuSeparator({ separator: true })).toBe(true);
  });

  it('does not treat action entries as separators', () => {
    const action: SbbMenuItem<string> = { label: 'Rename' };
    expect(isSbbMenuSeparator(action)).toBe(false);
  });

  it('passes the single value to a single-selection onSelect', () => {
    const received: string[] = [];
    const item: SbbMenuItem<string> = {
      label: 'Delete',
      onSelect: (data) => received.push(data),
    };
    if (!isSbbMenuSeparator(item)) {
      item.onSelect?.('queue-1');
    }
    expect(received).toEqual(['queue-1']);
  });

  it('accepts an array for a multi-selection onSelect', () => {
    let received: string | string[] | undefined;
    const item: SbbMenuItem<string> = {
      label: 'Delete all',
      supportedMultiSelection: true,
      onSelect: (data) => (received = data),
    };
    if (!isSbbMenuSeparator(item)) {
      item.onSelect?.(['a', 'b']);
    }
    expect(received).toEqual(['a', 'b']);
  });
});
