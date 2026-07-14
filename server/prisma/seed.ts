import prisma from "../src/utils/prisma.js"

async function main() {
    const org = await prisma.organization.create({
        data: { name: 'Acme Corp' },
    });

    const admin = await prisma.user.create({
        data: {
            organizationId: org.id,
            email: 'admin@acme.test',
            passwordHash: 'placeholder-hash', // real hashing comes in Auth step
            role: 'ADMIN',
        },
    });

    const visitor = await prisma.visitor.create({
        data: {
            organizationId: org.id,
            token: 'visitor-token-123',
        },
    });

    const conversation = await prisma.conversation.create({
        data: {
            organizationId: org.id,
            visitorId: visitor.id,
            status: 'NEW',
        },
    });

    await prisma.message.create({
        data: {
            conversationId: conversation.id,
            content: 'Hi, I need help with my order.',
            senderType: 'VISITOR',
        },
    });

    console.log({ org, admin, visitor, conversation });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });