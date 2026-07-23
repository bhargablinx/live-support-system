import api from "./axios";

const createVisitor = async (organizationId: string, name: string, email: string) => {
    try {
        const currentUrl = window.location.href;
        const response = await api.post(`visitor`, {
            organizationId,
            name,
            email,
            currentUrl
        });

        if (response.data.success) {
            // console.log(response.data);
            return response.data.data;
        }
    } catch (error) {
        console.log("Error while creating visitor token", error);
        return null;
    }
}

const createConversation = async (organizationId: string, visitorToken: string) => {
    try {
        const response = await api.post(`conversation`, {
            organizationId,
            visitorToken
        });

        if (response.data.success) {
            console.log(response.data);
            return response.data.data;
        }
    } catch (error) {
        console.log("Error while creating conversation", error);
        return null;
    }
}

const fetchMessages = async (conversationId: string, visitorToken: string) => {
    try {
        const response = await api.get(
            `conversation/${conversationId}/visitor-messages?visitorToken=${encodeURIComponent(visitorToken)}`
        );
        if (response.data.success) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.log("Error while fetching messages", error);
        localStorage.removeItem("conversationId");
        localStorage.removeItem("visitorToken");
        return null;
    }
};

const fetchMessagesStatus = async (conversationId: string, visitorToken: string) => {
    try {
        const response = await api.post(`conversation/resolved`, {
            conversationId,
            visitorToken
        });
        if (response.data.success) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.log("Error while fetching messages status", error);
        return null;
    }
}

export { createVisitor, createConversation, fetchMessages, fetchMessagesStatus }