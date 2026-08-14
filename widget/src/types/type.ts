export interface Attachment {
    id: string;
    messageId: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    createdAt: string;
}

export interface Message {
    id: string | number;
    conversationId: string;
    content: string;
    senderType: string;
    attachments?: Attachment[];
    createdAt: string;
}

export type SocketStatus = "connecting" | "connected" | "disconnected";

export interface AssignedUser {
    id: string;
    name?: string | null;
    email: string;
}

export interface Conversation {
    id: string;
    visitorId: string;
    status: "NEW" | "UNASSIGNED" | "CLAIMED" | "ACTIVE" | "RESOLVED" | "ARCHIVED";
    lastMessageAt?: string | null;
    assignedUser?: AssignedUser | null;
}