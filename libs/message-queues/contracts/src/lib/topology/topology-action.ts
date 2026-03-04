export type TopologyAction = {
  icon: string;
  displayName: string;
  actionType: string;
  parameters: Record<string, unknown>;
  actionGroup?: string;
}
