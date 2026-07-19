import { of } from 'rxjs';
import { BSON } from 'bson';
import { WebBackendApi } from './web-backend-api';

describe('WebBackendApi', () => {
  function apiReturning(result: unknown) {
    const bytes = BSON.serialize({ result });
    const blob = { bytes: () => Promise.resolve(bytes) } as unknown as Blob;
    const httpClient = { post: () => of(blob) } as any;
    return new WebBackendApi('http://localhost/api/', httpClient);
  }

  it('preserves Date instances instead of flattening them to {}', async () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const api = apiReturning({ createdAt });

    const response = (await api.managementDoRequest('test', {})) as {
      createdAt: unknown;
    };

    expect(response.createdAt).toBeInstanceOf(Date);
    expect((response.createdAt as Date).toISOString()).toBe(
      createdAt.toISOString(),
    );
  });

  it('still unwraps buffer-like values', async () => {
    const bytes = Uint8Array.from([1, 2, 3]);
    const api = apiReturning({ payload: bytes });

    const response = (await api.managementDoRequest('test', {})) as {
      payload: Iterable<number>;
    };

    expect(Array.from(response.payload)).toEqual([1, 2, 3]);
  });
});
