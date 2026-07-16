import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatPage from "./components/chat/ChatPage";
import type { Message } from "./types/type";
import type { SocketStatus } from "./types/type";
import { getSocket } from "./lib/socket";
import { getFromLocal, saveToLocal } from "./lib/utils";
import { createConversation } from "./lib/api";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "./store/store";
import { setVisitorToken } from "./features/auth/authSlice";

export default function App() {
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();
    const { organizationId, visitorToken } = useSelector((state: RootState) => state.auth);
    const [conversationId, setConversationId] = useState<string | null>(() => getFromLocal("conversationId"));
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

    // Initialize visitorToken from localStorage if available
    useEffect(() => {
        const storedToken = getFromLocal("visitorToken");
        if (storedToken && !visitorToken) {
            dispatch(setVisitorToken(storedToken));
        }
    }, [visitorToken, dispatch]);

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

        socket.on("receive_message", handleReceiveMessage);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("reconnect_attempt", handleConnecting);
            socket.off("connect_error", handleDisconnect);
            socket.off("receive_message", handleReceiveMessage);
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
            <ChatPage open={open} setOpen={setOpen} messages={messages} onSend={handleSend} socketStatus={socketStatus} />

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