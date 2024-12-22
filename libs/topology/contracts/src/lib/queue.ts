export type Queue = {
  id: string;
  name: string;
  messageCount: number;
  deadLetterMessageCount: number;
  transferDeadLetterMessageCount: number;
}
