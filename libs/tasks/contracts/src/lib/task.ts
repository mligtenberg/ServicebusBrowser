export type Task = {
  id: string;
  description: string;
  createdAt: Date;
  statusDescription?: string;
  status: 'in-progress' | 'completed';
  hasProgress?: boolean;
  progress?: number;
};
