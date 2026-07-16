export interface Message {
    id: string | number;
    conversationId: string;
    content: string;
    senderType: string;
    createdAt: string;
}

export interface Conversation {
    id: string;
    visitorId: string;
    status: "NEW" | "UNASSIGNED" | "CLAIMED" | "ACTIVE" | "RESOLVED" | "ARCHIVED";
    lastMessageAt: string | null;
}