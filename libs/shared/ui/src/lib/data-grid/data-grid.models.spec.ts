import { resolveField, SbbColumn } from './data-grid.models';

interface Row {
  id: number;
  name: string;
  nested: { subject: string };
}

describe('resolveField', () => {
  const row: Row = { id: 1, name: 'alpha', nested: { subject: 'hello' } };

  it('resolves a top-level field', () => {
    const col: SbbColumn<Row> = { field: 'name', header: 'Name' };
    expect(resolveField(row, col)).toBe('alpha');
  });

  it('resolves a dotted nested path', () => {
    const col: SbbColumn<Row> = { field: 'nested.subject', header: 'Subject' };
    expect(resolveField(row, col)).toBe('hello');
  });

  it('returns undefined for a missing path segment', () => {
    const col: SbbColumn<Row> = { field: 'nested.missing.x', header: 'X' };
    expect(resolveField(row, col)).toBeUndefined();
  });

  it('prefers an explicit value accessor over the dotted path', () => {
    const col: SbbColumn<Row> = {
      field: 'name',
      header: 'Name',
      value: (r) => `#${r.id}`,
    };
    expect(resolveField(row, col)).toBe('#1');
  });

  it('returns undefined for null/undefined rows', () => {
    const col: SbbColumn<Row> = { field: 'name', header: 'Name' };
    expect(resolveField(null as unknown as Row, col)).toBeUndefined();
    expect(resolveField(undefined as unknown as Row, col)).toBeUndefined();
  });
});
