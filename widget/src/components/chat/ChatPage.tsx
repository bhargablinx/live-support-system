import { ChatInput } from "@/components/chat/chat-input";

export default function ChatPage() {
    const handleSend = (message: string) => {
        console.log(message);
    };

    return (
        <div className="flex h-screen flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
                {/* Render messages here */}
            </div>

            {/* Input */}
            <ChatInput onSend={handleSend} />
        </div>
    );
}
