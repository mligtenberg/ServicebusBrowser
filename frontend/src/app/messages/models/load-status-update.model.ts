export type LoadStatus = 'loading' | 'loaded' | 'error';

export class LoadStatusUpdate {
    constructor(public readonly loadStatus: LoadStatus, public readonly totalLoaded?: number, public readonly error?: any) {}
}
