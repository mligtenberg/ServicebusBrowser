// types.d.ts
export {};

declare global {
  interface Uint8ArrayConstructor {
    fromBase64(
      base64: string,
      options?: {
        alphabet?: 'base64' | 'base64url';
        lastChunkHandling?: 'loose' | 'strict' | 'stop-before-partial';
      },
    ): Uint8Array;

    fromHex(hex: string): Uint8Array;

    fromBinary(binary: string): Uint8Array;
  }

  interface Uint8Array {
    toBase64(options?: {
      alphabet?: 'base64' | 'base64url';
      omitPadding?: boolean;
    }): string;

    toHex(): string;

    toBinary(): string;
  }
}
