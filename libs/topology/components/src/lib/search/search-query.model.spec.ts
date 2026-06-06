import {
  flattenTypeKey,
  rankByPrefix,
  resolveAcceleratorType,
  SUGGESTION_GROUP_CAP,
  SUGGESTION_TOTAL_CAP,
} from './search-query.model';

describe('flattenTypeKey', () => {
  it('lowercases a simple key', () => {
    expect(flattenTypeKey('exchange')).toBe('exchange');
  });

  it('flattens camelCase eventHub → eventhub', () => {
    expect(flattenTypeKey('eventHub')).toBe('eventhub');
  });

  it('flattens camelCase consumerGroup → consumergroup', () => {
    expect(flattenTypeKey('consumerGroup')).toBe('consumergroup');
  });

  it('flattens PascalCase Connection → connection', () => {
    expect(flattenTypeKey('Connection')).toBe('connection');
  });
});

describe('resolveAcceleratorType', () => {
  const available = ['connection', 'exchange', 'eventHub', 'consumerGroup', 'queue'];

  it('resolves an exact lowercase key', () => {
    expect(resolveAcceleratorType('connection', available)).toBe('connection');
  });

  it('resolves exchange in lowercase', () => {
    expect(resolveAcceleratorType('exchange', available)).toBe('exchange');
  });

  it('resolves eventhub (flattened) to eventHub', () => {
    expect(resolveAcceleratorType('eventhub', available)).toBe('eventHub');
  });

  it('resolves consumergroup (flattened) to consumerGroup', () => {
    expect(resolveAcceleratorType('consumergroup', available)).toBe('consumerGroup');
  });

  it('is case-insensitive for user input EVENTHUB', () => {
    expect(resolveAcceleratorType('EVENTHUB', available)).toBe('eventHub');
  });

  it('returns null for unknown keys', () => {
    expect(resolveAcceleratorType('unknown', available)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(resolveAcceleratorType('', available)).toBeNull();
  });
});

describe('rankByPrefix', () => {
  const names = ['apple', 'Apricot', 'banana', 'avocado', 'cherry', 'Application'];

  it('places prefix matches before substring-only matches', () => {
    const result = rankByPrefix(names, 'app');
    const prefixGroup = result.filter((n) => n.toLowerCase().startsWith('app'));
    const substrGroup = result.filter((n) => !n.toLowerCase().startsWith('app'));
    const lastPrefixIdx = Math.max(...prefixGroup.map((n) => result.indexOf(n)));
    const firstSubstrIdx = Math.min(...substrGroup.map((n) => result.indexOf(n)));
    // All prefix matches must come before any substring-only match
    expect(lastPrefixIdx).toBeLessThan(firstSubstrIdx);
  });

  it('sorts alphabetically within each tier', () => {
    const result = rankByPrefix(['zebra', 'zoo', 'zap'], 'z');
    // All are prefix matches, so alphabetical order expected
    expect(result).toEqual(['zap', 'zebra', 'zoo']);
  });

  it('handles empty fragment — all treated as prefix, alphabetical', () => {
    const result = rankByPrefix(['banana', 'apple', 'cherry'], '');
    expect(result).toEqual(['apple', 'banana', 'cherry']);
  });

  it('returns empty array for no names', () => {
    expect(rankByPrefix([], 'foo')).toEqual([]);
  });

  it('handles names that only match as substring', () => {
    const result = rankByPrefix(['pineapple', 'snapple', 'grapple'], 'apple');
    // None start with 'apple', so all are substring matches, alphabetical
    expect(result).toEqual(['grapple', 'pineapple', 'snapple']);
  });

  it('a name starting with fragment (case-insensitive) ranks above one that only contains it', () => {
    const result = rankByPrefix(['pineapple', 'Apple'], 'apple');
    expect(result[0]).toBe('Apple');
    expect(result[1]).toBe('pineapple');
  });
});

describe('SUGGESTION_TOTAL_CAP', () => {
  it('is a positive integer', () => {
    expect(SUGGESTION_TOTAL_CAP).toBeGreaterThan(0);
    expect(Number.isInteger(SUGGESTION_TOTAL_CAP)).toBe(true);
  });

  it('is 10', () => {
    expect(SUGGESTION_TOTAL_CAP).toBe(10);
  });
});

describe('SUGGESTION_GROUP_CAP (deprecated alias)', () => {
  it('equals SUGGESTION_TOTAL_CAP for backward compatibility', () => {
    expect(SUGGESTION_GROUP_CAP).toBe(SUGGESTION_TOTAL_CAP);
  });
});
