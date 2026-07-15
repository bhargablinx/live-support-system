import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
    organizationId: string | null;
    visitorToken: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    organizationId: "cmrl2nuyw0000eknz1yorpmq1",
    visitorToken: null,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setOrganizationId: (state, action) => {
            state.organizationId = action.payload;
        },
        setVisitorToken: (state, action) => {
            state.visitorToken = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    }
})

export const { setOrganizationId, setVisitorToken, setLoading, setError } = authSlice.actions;
export default authSlice.reducer