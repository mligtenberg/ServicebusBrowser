// Jest stand-in for @zip.js/zip.js (see jest.config.ts). The real package
// touches browser worker APIs at import time that jest cannot handle, and
// main-ui specs never zip anything.
export class ZipReader {}
export class ZipWriter {}
export class BlobWriter {}
export class BlobReader {}
export class TextWriter {}
export class TextReader {}
