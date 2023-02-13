import { TestBed } from '@angular/core/testing';

import { MessagesComponentStoreService } from './messages-component-store.service';

describe('MessagesComponentStoreService', () => {
  let service: MessagesComponentStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessagesComponentStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
