import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatPage from "./components/chat/ChatPage";
import type { Message } from "./types/type";

export default function App() {
    const [open, setOpen] = useState(false);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            conversationId: "faf",
            content: "👋 Hi! How can we help you today?",
            senderType: "AGENT",
            createdAt: new Date().toISOString()
        },
    ]);

    const handleSend = (message: string) => {
        setMessages((prev) => [
            ...prev,
            {
                id: Date.now(),
                conversationId: "faf",
                content: message,
                senderType: "VISITOR",
                createdAt: new Date().toISOString()
            },
        ]);
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
            <ChatPage open={open} setOpen={setOpen} messages={messages} onSend={handleSend} />

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