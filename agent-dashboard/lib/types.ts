// Enums (mirror Prisma schema)
export type UserRole = "ADMIN" | "AGENT";

export type ConversationStatus =
    | "NEW"
    | "UNASSIGNED"
    | "CLAIMED"
    | "ACTIVE"
    | "RESOLVED"
    | "ARCHIVED";

export type SenderType = "VISITOR" | "AGENT";

// Core Entities (mirror Prisma models)
export interface Organization {
    id: string;
    name: string;
    createdAt: string;
}

export interface User {
    id: string;
    organizationId: string;
    email: string;
    role: UserRole;
    createdAt: string;
}

export interface Visitor {
    id: string;
    organizationId: string;
    token: string;
    name?: string | null;
    email?: string | null;
    createdAt: string;
}

export interface Conversation {
    id: string;
    organizationId: string;
    visitorId: string;
    visitor?: Visitor;
    assignedUserId: string | null;
    assignedUser?: User | null;
    status: ConversationStatus;
    messages?: Message[];
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    id: string;
    conversationId: string;
    content: string;
    senderType: SenderType;
    createdAt: string;
}

// API — Generic Response Envelope
export interface ApiResponse<T = unknown> {
    statusCode: number;
    message: string;
    data: T;
}

export interface ApiError {
    statusCode: number;
    message: string;
    error: string;
}

// API — Auth
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegistrationRequest {
    organizationName: string;
    email: string;
    password: string;
}

export interface AuthResponseData {
    organization: Pick<Organization, "id" | "name">;
    user: User;
}

// API — Conversation
export interface CreateConversationRequest {
    organizationId: string;
    visitorToken: string;
}

export interface CreateConversationResponseData {
    conversationId: string;
    visitorId: string;
}

// API — Visitor
export interface CreateVisitorRequest {
    organizationId: string;
}

export interface CreateVisitorResponseData {
    visitorToken: string;
}

// Socket.IO — Event Payloads
/** Client → Server */
export interface JoinRoomPayload {
    conversationId: string;
}

/** Client → Server */
export interface SendMessagePayload {
    conversationId: string;
    content: string;
}

/** Server → Client */
export interface RoomJoinedPayload {
    conversationId: string;
}

/** Server → Client (same shape as Message entity) */
export type ReceiveMessagePayload = Message;

// UI State Types
export interface AuthState {
    user: User | null;
    organization: Pick<Organization, "id" | "name"> | null;
    isAuthenticated: boolean;
}