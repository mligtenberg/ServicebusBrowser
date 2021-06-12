export interface ITask {
  id: string;
  title: string;
  subtitle: string;
  donePercentage: number;
  progressBarMessage?: string;
}
