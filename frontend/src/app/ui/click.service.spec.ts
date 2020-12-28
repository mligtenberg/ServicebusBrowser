import { TestBed } from '@angular/core/testing';

import { ClickService } from './click.service';

describe('ClickService', () => {
  let service: ClickService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClickService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
