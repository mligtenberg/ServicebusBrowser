import { TestBed } from '@angular/core/testing';

import { QueuesService } from './queues.service';

describe('QueuesService', () => {
  let service: QueuesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueuesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
