import { UUID } from '@service-bus-browser/shared-contracts';

export type Task = {
  id: UUID;
  description: string;
  createdAt: Date;
  statusDescription?: string;
  status: 'in-progress' | 'completed';
  hasProgress?: boolean;
  progress?: number;
};
