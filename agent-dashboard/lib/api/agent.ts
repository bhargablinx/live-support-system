import api from "@/lib/axios";
import { ApiResponse } from "@/lib/types";
import { Agent, AgentListResponse, CreateAgentRequest } from "@/lib/types";

export const fetchAgents = async (): Promise<ApiResponse<AgentListResponse>> => {
    const response = await api.get("/agents");
    return response.data;
};

export const createAgent = async (
    payload: CreateAgentRequest
): Promise<ApiResponse<{ agent: Agent }>> => {
    const response = await api.post("/agents", payload);
    return response.data;
};

export const deleteAgent = async (agentId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/agents/${agentId}`);
    return response.data;
};
