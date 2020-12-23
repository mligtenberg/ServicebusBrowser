import { TestBed } from '@angular/core/testing';

import { ContextmenuService } from './contextmenu.service';

describe('ContextmenuService', () => {
  let service: ContextmenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContextmenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
