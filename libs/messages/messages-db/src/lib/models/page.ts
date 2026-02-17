import { UUID } from '@service-bus-browser/shared-contracts';

export interface Page {
  id: UUID;
  name: string;
  retrievedAt: Date;
}
