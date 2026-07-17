import api from "@/lib/axios";
import { LoginRequest, RegistrationRequest } from "@/lib/types";

const handleLogin = async ({ email, password }: LoginRequest) => {
    try {
        const response = await api.post("/auth/login", {
            email,
            password
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

const handleRegistration = async ({ organizationName, email, password }: RegistrationRequest) => {
    try {
        const response = await api.post("/auth/register", {
            organizationName,
            email,
            password
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export { handleLogin, handleRegistration }