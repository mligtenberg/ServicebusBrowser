import { TestBed } from '@angular/core/testing';

import { ServicebusConnectionService } from './servicebus-connection.service';

describe('ServicebusConnectionServiceService', () => {
  let service: ServicebusConnectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicebusConnectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
