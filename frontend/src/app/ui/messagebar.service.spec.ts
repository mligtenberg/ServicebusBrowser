import { TestBed } from '@angular/core/testing';

import { MessagebarService } from './messagebar.service';

describe('MessagebarService', () => {
  let service: MessagebarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessagebarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
