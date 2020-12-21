import { TestBed } from '@angular/core/testing';

import { LoggingServiceService } from './logging-service.service';

describe('LoggingServiceService', () => {
  let service: LoggingServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoggingServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
