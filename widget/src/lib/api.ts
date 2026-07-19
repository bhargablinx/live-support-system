import api from "./axios";

const createVisitor = async (organizationId: string, name: string, email: string) => {
    try {
        const response = await api.post(`visitor`, {
            organizationId,
            name,
            email
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

export { createVisitor, createConversation }