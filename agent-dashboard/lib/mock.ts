import { Conversation, Message, Visitor } from "./types";

export const mockVisitors: Record<string, Visitor> = {
    "visitor-1": {
        id: "visitor-1",
        organizationId: "org-1",
        token: "token-visitor-1",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    },
    "visitor-2": {
        id: "visitor-2",
        organizationId: "org-1",
        token: "token-visitor-2",
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
    },
    "visitor-3": {
        id: "visitor-3",
        organizationId: "org-1",
        token: "token-visitor-3",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    },
    "visitor-4": {
        id: "visitor-4",
        organizationId: "org-1",
        token: "token-visitor-4",
        createdAt: new Date(Date.now() - 600000).toISOString(), // 10 mins ago
    }
};

// Custom meta info for mock visitors to display in details panel
export interface VisitorDetail extends Visitor {
    name: string;
    email: string;
    location: string;
    currentUrl: string;
    browser: string;
    os: string;
    notes?: string;
}

export const mockVisitorDetails: Record<string, VisitorDetail> = {
    "visitor-1": {
        ...mockVisitors["visitor-1"],
        name: "Sarah Jenkins",
        email: "sarah.jenkins@example.com",
        location: "San Francisco, USA",
        currentUrl: "https://acme.com/pricing",
        browser: "Chrome 122.0.0",
        os: "macOS Sonoma",
        notes: "Interested in the Enterprise pricing model. Requested discount options.",
    },
    "visitor-2": {
        ...mockVisitors["visitor-2"],
        name: "Alex Rivera",
        email: "alex.rivera@gmail.com",
        location: "Madrid, Spain",
        currentUrl: "https://acme.com/docs/getting-started",
        browser: "Firefox 123.0",
        os: "Ubuntu 22.04 LTS",
        notes: "Struggling with SDK integration. Followed documentation but got config errors.",
    },
    "visitor-3": {
        ...mockVisitors["visitor-3"],
        name: "Yuki Tanaka",
        email: "y.tanaka@techcorp.jp",
        location: "Tokyo, Japan",
        currentUrl: "https://acme.com/features/live-chat",
        browser: "Safari 17.2",
        os: "iOS 17.3",
    },
    "visitor-4": {
        ...mockVisitors["visitor-4"],
        name: "Anonymous Visitor",
        email: "Not provided",
        location: "Sydney, Australia",
        currentUrl: "https://acme.com/checkout",
        browser: "Chrome 122.0.0",
        os: "Windows 11",
        notes: "Idle on checkout page for 5 minutes.",
    }
};

export const mockConversations: Conversation[] = [
    {
        id: "conv-1",
        organizationId: "org-1",
        visitorId: "visitor-1",
        visitor: mockVisitors["visitor-1"],
        assignedUserId: "agent-1", // claimed
        status: "CLAIMED",
        createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        updatedAt: new Date(Date.now() - 300000).toISOString(), // 5 mins ago
    },
    {
        id: "conv-2",
        organizationId: "org-1",
        visitorId: "visitor-2",
        visitor: mockVisitors["visitor-2"],
        assignedUserId: null, // unassigned
        status: "NEW",
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        updatedAt: new Date(Date.now() - 900000).toISOString(), // 15 mins ago
    },
    {
        id: "conv-3",
        organizationId: "org-1",
        visitorId: "visitor-3",
        visitor: mockVisitors["visitor-3"],
        assignedUserId: null, // unassigned
        status: "NEW",
        createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
        updatedAt: new Date(Date.now() - 600000).toISOString(), // 10 mins ago
    },
    {
        id: "conv-4",
        organizationId: "org-1",
        visitorId: "visitor-4",
        visitor: mockVisitors["visitor-4"],
        assignedUserId: "agent-1", // claimed
        status: "RESOLVED",
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
    }
];

export const mockMessages: Record<string, Message[]> = {
    "conv-1": [
        {
            id: "msg-1-1",
            conversationId: "conv-1",
            content: "Hi there, I'm looking at your Enterprise plan. Can I get a custom quote for 250 seats?",
            senderType: "VISITOR",
            createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
            id: "msg-1-2",
            conversationId: "conv-1",
            content: "Hello! I'd be happy to assist you with that. Yes, we offer tier discounts for 100+ seats.",
            senderType: "AGENT",
            createdAt: new Date(Date.now() - 7000000).toISOString(),
        },
        {
            id: "msg-1-3",
            conversationId: "conv-1",
            content: "Great, what details do you need from me to prepare the invoice estimate?",
            senderType: "VISITOR",
            createdAt: new Date(Date.now() - 300000).toISOString(),
        }
    ],
    "conv-2": [
        {
            id: "msg-2-1",
            conversationId: "conv-2",
            content: "Hello? I am trying to run the npm dev server but I keep getting a 'module not found' error. Please help.",
            senderType: "VISITOR",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
            id: "msg-2-2",
            conversationId: "conv-2",
            content: "It says it cannot find next/dist/server/api-utils.",
            senderType: "VISITOR",
            createdAt: new Date(Date.now() - 3500000).toISOString(),
        }
    ],
    "conv-3": [
        {
            id: "msg-3-1",
            conversationId: "conv-3",
            content: "Do you support Japanese localization for the widget?",
            senderType: "VISITOR",
            createdAt: new Date(Date.now() - 1800000).toISOString(),
        }
    ],
    "conv-4": [
        {
            id: "msg-4-1",
            conversationId: "conv-4",
            content: "Is checkout secure?",
            senderType: "VISITOR",
            createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
            id: "msg-4-2",
            conversationId: "conv-4",
            content: "Yes, all checkout operations are fully encrypted via Stripe.",
            senderType: "AGENT",
            createdAt: new Date(Date.now() - 7100000).toISOString(),
        },
        {
            id: "msg-4-3",
            conversationId: "conv-4",
            content: "Perfect, thanks for the quick help!",
            senderType: "VISITOR",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
        }
    ]
};
