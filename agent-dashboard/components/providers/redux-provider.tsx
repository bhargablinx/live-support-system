"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store, useAppDispatch } from "@/lib/store/store";
import { checkAuth } from "@/lib/store/auth-slice";

function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);

    return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <AuthInitializer>{children}</AuthInitializer>
        </Provider>
    );
}
