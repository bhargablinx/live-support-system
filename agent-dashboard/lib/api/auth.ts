import api from "@/lib/axios";

const handleLogin = async (email: string, password: string) => {
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

export { handleLogin }