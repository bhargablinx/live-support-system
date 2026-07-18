import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { 
    handleLogin, 
    handleRegistration, 
    fetchMe, 
    handleLogout 
} from "@/lib/api/auth";
import { 
    LoginRequest, 
    RegistrationRequest, 
    User, 
    Organization, 
    ApiResponse, 
    AuthResponseData,
    ApiError
} from "@/lib/types";
import axios from "axios";

interface ReduxAuthState {
    user: User | null;
    organization: Pick<Organization, "id" | "name"> | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: ReduxAuthState = {
    user: null,
    organization: null,
    isAuthenticated: false,
    loading: true, // starts true to prevent flash of content on initial load
    error: null,
};

// Helper to extract error message
const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const apiError = error.response?.data as ApiError;
        return apiError?.message || "An unexpected error occurred.";
    }
    return error instanceof Error ? error.message : "An unexpected error occurred.";
};

export const loginUser = createAsyncThunk(
    "auth/login",
    async (credentials: LoginRequest, { rejectWithValue }) => {
        try {
            const response: ApiResponse<AuthResponseData> = await handleLogin(credentials);
            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const registerUser = createAsyncThunk(
    "auth/register",
    async (data: RegistrationRequest, { rejectWithValue }) => {
        try {
            const response: ApiResponse<AuthResponseData> = await handleRegistration(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const checkAuth = createAsyncThunk(
    "auth/check",
    async (_, { rejectWithValue }) => {
        try {
            const response: ApiResponse<AuthResponseData> = await fetchMe();
            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await handleLogout();
            return null;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Login
        builder.addCase(loginUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponseData>) => {
            state.user = action.payload.user;
            state.organization = action.payload.organization;
            state.isAuthenticated = true;
            state.loading = false;
        });
        builder.addCase(loginUser.rejected, (state, action) => {
            state.error = action.payload as string;
            state.loading = false;
        });

        // Register
        builder.addCase(registerUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthResponseData>) => {
            state.user = action.payload.user;
            state.organization = action.payload.organization;
            state.isAuthenticated = true;
            state.loading = false;
        });
        builder.addCase(registerUser.rejected, (state, action) => {
            state.error = action.payload as string;
            state.loading = false;
        });

        // Check Auth
        builder.addCase(checkAuth.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(checkAuth.fulfilled, (state, action: PayloadAction<AuthResponseData>) => {
            state.user = action.payload.user;
            state.organization = action.payload.organization;
            state.isAuthenticated = true;
            state.loading = false;
        });
        builder.addCase(checkAuth.rejected, (state) => {
            state.user = null;
            state.organization = null;
            state.isAuthenticated = false;
            state.loading = false;
        });

        // Logout
        builder.addCase(logoutUser.fulfilled, (state) => {
            state.user = null;
            state.organization = null;
            state.isAuthenticated = false;
            state.loading = false;
        });
    },
});

export const { clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;
