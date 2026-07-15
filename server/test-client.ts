import 'dotenv/config';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:8000/api/v1';
const SOCKET_URL = 'http://localhost:8000';

const mode = process.argv[2]; // 'visitor' or 'agent'

if (!mode || !['visitor', 'agent'].includes(mode)) {
    console.error('Usage: npx tsx test-client.ts <visitor|agent> [conversationId] [agentToken]');
    process.exit(1);
}

async function runVisitor() {
    // 1. Create a visitor
    const visitorRes = await fetch(`${API_URL}/visitor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: process.env.TEST_ORG_ID }),
    });
    const visitor = await visitorRes.json();
    console.log('Created visitor:', visitor);
    const visitorToken = visitor.data?.visitorToken;

    if (!visitorToken) {
        console.error('Failed to retrieve visitorToken from API response');
        return;
    }

    // 2. Create a conversation for that visitor
    const convoRes = await fetch(`${API_URL}/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            organizationId: process.env.TEST_ORG_ID,
            visitorToken,
        }),
    });
    const conversation = await convoRes.json();
    console.log('Created conversation:', conversation);
    const conversationId = conversation.data?.conversationId;

    if (!conversationId) {
        console.error('Failed to retrieve conversationId from API response');
        return;
    }

    console.log(`\n👉 Run the agent in another terminal with:\nnpx tsx test-client.ts agent ${conversationId} <AGENT_JWT>\n`);

    // 3. Connect via socket as this visitor
    const socket = io(SOCKET_URL, {
        auth: { visitorToken },
    });

    socket.on('connect', () => {
        console.log('[visitor] connected, socket id:', socket.id);
        socket.emit('join_room', { conversationId });
    });

    socket.on('room_joined', ({ conversationId }) => {
        console.log('[visitor] joined room:', conversationId);
    });

    socket.on('receive_message', (msg) => {
        console.log('[visitor] received message:', msg);
        if (msg.senderType === 'AGENT') {
            setTimeout(() => {
                socket.emit('send_message', {
                    conversationId,
                    content: 'Hello! I need help tracking my package.',
                });
            }, 1500);
        }
    });

    socket.on('connect_error', (err) => {
        console.error('[visitor] connect error:', err.message);
    });
}

async function runAgent() {
    const conversationId = process.argv[3];
    const agentToken = process.argv[4];

    if (!conversationId || !agentToken) {
        console.error('Agent mode requires: npx tsx test-client.ts agent <conversationId> <agentJWT>');
        process.exit(1);
    }

    const socket = io(SOCKET_URL, {
        auth: { token: agentToken },
    });

    socket.on('connect', () => {
        console.log('[agent] connected, socket id:', socket.id);
        socket.emit('join_room', { conversationId });
    });

    socket.on('room_joined', ({ conversationId }) => {
        console.log('[agent] joined room:', conversationId);
        // Start the conversation by sending an initial greeting
        setTimeout(() => {
            socket.emit('send_message', {
                conversationId,
                content: 'Hello, I am your support agent. How can I help you today?',
            });
        }, 1000);
    });

    socket.on('receive_message', (msg) => {
        console.log('[agent] received message:', msg);

        // Auto-reply once if the message is from the visitor
        if (msg.senderType === 'VISITOR') {
            setTimeout(() => {
                socket.emit('send_message', {
                    conversationId,
                    content: 'Sure! Let me look up your account details.',
                });
            }, 1500);
        }
    });

    socket.on('connect_error', (err) => {
        console.error('[agent] connect error:', err.message);
    });
}

if (mode === 'visitor') {
    runVisitor();
} else {
    runAgent();
}