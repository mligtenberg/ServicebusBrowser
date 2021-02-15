import { FirstLinePipe } from './first-line.pipe';

describe('FirstLinePipe', () => {
  it('create an instance', () => {
    const pipe = new FirstLinePipe();
    expect(pipe).toBeTruthy();
  });
});
