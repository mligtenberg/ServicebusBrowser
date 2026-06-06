import { TestBed } from '@angular/core/testing';
import { MessageModificationEngine } from './batch-actions.service';
import { Message } from '@service-bus-browser/api-contracts';
import { AlterBodyPartialReplaceAction, AlterPropertyPartialReplaceAction } from './batch-actions.model';

describe('MessageModificationEngine', () => {
  let service: MessageModificationEngine;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageModificationEngine);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('searchAndReplace', () => {
    it('should replace all instances in the body', () => {
      const message: Message = {
        id: '1',
        body: new TextEncoder().encode('foo bar foo baz'),
        properties: {},
        applicationProperties: {}
      } as any;

      const action: AlterBodyPartialReplaceAction = {
        type: 'alter',
        target: 'body',
        alterType: 'searchAndReplace',
        searchValue: 'foo',
        value: 'qux',
        applyOnFilter: undefined as any
      };

      const result = service.applyBatchAction(message, action);
      const decodedBody = new TextDecoder().decode(result.body);

      expect(decodedBody).toBe('qux bar qux baz');
    });

    it('should replace all instances in application properties', () => {
      const message: Message = {
        id: '1',
        body: new TextEncoder().encode(''),
        properties: {},
        applicationProperties: {
          myProp: 'foo bar foo baz'
        }
      } as any;

      const action: AlterPropertyPartialReplaceAction = {
        type: 'alter',
        target: 'applicationProperties',
        fieldName: 'myProp',
        alterType: 'searchAndReplace',
        searchValue: 'foo',
        value: 'qux',
        applyOnFilter: undefined as any
      } as any;

      const result = service.applyBatchAction(message, action);

      expect(result.applicationProperties?.['myProp']).toBe('qux bar qux baz');
    });
  });
});
