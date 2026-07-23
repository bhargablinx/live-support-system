import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatPage from "./components/chat/ChatPage";
import type { Message } from "./types/type";
import type { SocketStatus } from "./types/type";
import { getSocket } from "./lib/socket";
import { getFromLocal, saveToLocal } from "./lib/utils";
import { createConversation, fetchMessages, fetchLatestConversation } from "./lib/api";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "./store/store";
import { setVisitorToken } from "./features/auth/authSlice";

export default function App() {
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();
    const { organizationId, visitorToken } = useSelector((state: RootState) => state.auth);
    const [conversationId, setConversationId] = useState<string | null>(() => getFromLocal("conversationId"));
    const [isResolved, setIsResolved] = useState(false);
    const [isAgentTyping, setIsAgentTyping] = useState(false);
    const [socketStatus, setSocketStatus] = useState<SocketStatus>(() => {
        if (!visitorToken) return "disconnected";
        const socket = getSocket(visitorToken);
        return socket.connected ? "connected" : "connecting";
    });

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            conversationId: "welcome",
            content: "👋 Hi! How can we help you today?",
            senderType: "AGENT",
            createdAt: new Date().toISOString()
        },
    ]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Initialize visitorToken from localStorage if available
    useEffect(() => {
        const storedToken = getFromLocal("visitorToken");
        if (storedToken && !visitorToken) {
            dispatch(setVisitorToken(storedToken));
        }
    }, [visitorToken, dispatch]);

    // Sync latest conversation on startup/visitorToken load
    useEffect(() => {
        if (!visitorToken) return;

        const syncConversation = async () => {
            setHistoryLoading(true);
            try {
                const latestConvo = await fetchLatestConversation(visitorToken);
                if (latestConvo) {
                    setConversationId(latestConvo.id);
                    saveToLocal("conversationId", latestConvo.id);

                    const isConvoResolved = latestConvo.status === "RESOLVED" || latestConvo.status === "ARCHIVED";
                    setIsResolved(isConvoResolved);

                    // Fetch messages
                    const history = await fetchMessages(latestConvo.id, visitorToken);
                    if (history && history.length > 0) {
                        setMessages(history);
                    } else {
                        setMessages([
                            {
                                id: `welcome-${Date.now()}`,
                                conversationId: latestConvo.id,
                                content: "👋 Hi! How can we help you today?",
                                senderType: "AGENT",
                                createdAt: latestConvo.createdAt
                            }
                        ]);
                    }

                    if (isConvoResolved) {
                        setMessages((prev) => {
                            const systemText = latestConvo.status === "RESOLVED"
                                ? "🔒 This conversation has been resolved by the agent."
                                : "🔒 This conversation has been archived due to inactivity.";
                            const systemMsgId = `${latestConvo.status.toLowerCase()}-${Date.now()}`;
                            if (prev.some((m) => String(m.id).startsWith("resolved-") || String(m.id).startsWith("archived-"))) return prev;
                            return [
                                ...prev,
                                {
                                    id: systemMsgId,
                                    conversationId: latestConvo.id,
                                    content: systemText,
                                    senderType: "SYSTEM",
                                    createdAt: new Date().toISOString()
                                }
                            ];
                        });
                    }
                } else {
                    setConversationId(null);
                    localStorage.removeItem("conversationId");
                    setIsResolved(false);
                    setMessages([
                        {
                            id: 1,
                            conversationId: "welcome",
                            content: "👋 Hi! How can we help you today?",
                            senderType: "AGENT",
                            createdAt: new Date().toISOString()
                        },
                    ]);
                }
            } catch (err) {
                console.error("Error syncing conversation:", err);
            } finally {
                setHistoryLoading(false);
            }
        };

        void syncConversation();
    }, [visitorToken]);

    // Socket message listening + connection status tracking
    useEffect(() => {
        if (!visitorToken) return;

        const socket = getSocket(visitorToken);

        const handleConnect = () => setSocketStatus("connected");
        const handleDisconnect = () => setSocketStatus("disconnected");
        const handleConnecting = () => setSocketStatus("connecting");

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("reconnect_attempt", handleConnecting);
        socket.on("connect_error", handleDisconnect);

        if (conversationId) {
            socket.emit("join_room", { conversationId });
        }

        const handleReceiveMessage = (msg: Message) => {
            setMessages((prev) => {
                // Avoid duplicating messages already appended locally
                if (prev.some((m) => String(m.id) === String(msg.id))) return prev;
                return [...prev, msg];
            });
        };

        const handleResolved = (convo) => {
            if (convo.id === conversationId) {
                setIsResolved(true);
                setMessages((prev) => {
                    const systemMsgId = `resolved-${Date.now()}`;
                    if (prev.some((m) => String(m.id).startsWith("resolved-"))) return prev;
                    return [
                        ...prev,
                        {
                            id: systemMsgId,
                            conversationId: convo.id,
                            content: "🔒 This conversation has been resolved by the agent.",
                            senderType: "SYSTEM",
                            createdAt: new Date().toISOString()
                        }
                    ];
                });
            }
        };

        const handleArchived = (convo) => {
            if (convo.id === conversationId) {
                setIsResolved(true);
                setMessages((prev) => {
                    const systemMsgId = `archived-${Date.now()}`;
                    if (prev.some((m) => String(m.id).startsWith("archived-"))) return prev;
                    return [
                        ...prev,
                        {
                            id: systemMsgId,
                            conversationId: convo.id,
                            content: "🔒 This conversation has been archived due to inactivity.",
                            senderType: "SYSTEM",
                            createdAt: new Date().toISOString()
                        }
                    ];
                });
            }
        };

        const handleReopened = (convo) => {
            if (convo.id === conversationId) {
                setIsResolved(false);
                setMessages((prev) => [
                    ...prev,
                    {
                        id: `reopened-${Date.now()}`,
                        conversationId: convo.id,
                        content: "🔓 This conversation has been reopened by the agent.",
                        senderType: "SYSTEM",
                        createdAt: new Date().toISOString()
                    }
                ]);
            }
        };

        socket.on("receive_message", handleReceiveMessage);
        socket.on("conversation_resolved", handleResolved);
        socket.on("conversation_archived", handleArchived);
        socket.on("conversation_reopened", handleReopened);

        const handleTypingStart = ({ actorType, conversationId: convoId }: { actorId: string; actorType: string; conversationId: string }) => {
            if (actorType === "agent" && convoId === conversationId) {
                setIsAgentTyping(true);
            }
        };

        const handleTypingStop = ({ conversationId: convoId }: { actorId: string; conversationId: string }) => {
            if (convoId === conversationId) {
                setIsAgentTyping(false);
            }
        };

        socket.on("typing_start", handleTypingStart);
        socket.on("typing_stop", handleTypingStop);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("reconnect_attempt", handleConnecting);
            socket.off("connect_error", handleDisconnect);
            socket.off("receive_message", handleReceiveMessage);
            socket.off("conversation_resolved", handleResolved);
            socket.off("conversation_archived", handleArchived);
            socket.off("conversation_reopened", handleReopened);
            socket.off("typing_start", handleTypingStart);
            socket.off("typing_stop", handleTypingStop);
        };
    }, [visitorToken, conversationId]);

    const handleSend = async (message: string) => {
        let currentConvoId = conversationId;

        if (!currentConvoId) {
            if (!visitorToken) {
                console.log("No visitor token available yet.");
                return;
            }
            if (!organizationId) {
                console.log("No organization ID available.");
                return;
            }

            const res = await createConversation(organizationId, visitorToken);
            if (res && res.conversationId) {
                currentConvoId = res.conversationId;
                saveToLocal("conversationId", res.conversationId);
                setConversationId(res.conversationId);
            } else {
                console.log("Failed to create conversation");
                return;
            }
        }

        // Emit the message via socket
        const socket = getSocket(visitorToken!);
        socket.emit("send_message", {
            content: message,
            conversationId: currentConvoId
        });
    };

    // Emit type_start / type_stop to the server
    const handleTypingChange = (isTyping: boolean) => {
        if (!conversationId || !visitorToken) return;
        const socket = getSocket(visitorToken);
        socket.emit(isTyping ? "type_start" : "type_stop", { conversationId });
    };

    const handleCreateNewIssue = async () => {
        if (!visitorToken || !organizationId) return;

        setHistoryLoading(true);
        try {
            const res = await createConversation(organizationId, visitorToken);
            if (res && res.conversationId) {
                saveToLocal("conversationId", res.conversationId);
                setConversationId(res.conversationId);
                setIsResolved(false);
                setMessages([
                    {
                        id: `welcome-${Date.now()}`,
                        conversationId: res.conversationId,
                        content: "👋 Hi! How can we help you today?",
                        senderType: "AGENT",
                        createdAt: new Date().toISOString()
                    }
                ]);
            }
        } catch (err) {
            console.error("Failed to create new conversation", err);
        } finally {
            setHistoryLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-muted/30">
            {/* Your Home Page */}
            <div className="container mx-auto py-20">
                <h1 className="text-5xl font-bold">Enterprise Live Support</h1>
                <p className="mt-4 text-muted-foreground">
                    Demo landing page here...
                </p>
            </div>

            {/* Chat Window */}
            <ChatPage
                open={open}
                setOpen={setOpen}
                messages={messages}
                onSend={handleSend}
                socketStatus={socketStatus}
                isResolved={isResolved}
                isAgentTyping={isAgentTyping}
                onTypingChange={handleTypingChange}
                historyLoading={historyLoading}
                onCreateNewIssue={handleCreateNewIssue}
            />

            {/* Floating Button */}
            <Button
                size="icon"
                className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-xl"
                onClick={() => setOpen((prev) => !prev)}
            >
                {open ? (
                    <X className="h-7 w-7" />
                ) : (
                    <MessageCircle className="h-7 w-7" />
                )}
            </Button>
        </div>
    );
}