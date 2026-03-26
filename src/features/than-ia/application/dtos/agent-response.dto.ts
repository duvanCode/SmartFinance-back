export class AgentResponseDto {
  chatText: string;
  speechText: string;
  action?: {
    type: string;
    payload: Record<string, unknown>;
    jsCode?: string;
  };
}
