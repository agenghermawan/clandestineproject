"use client";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [authState, setAuthState] = useState("loading");
    const [user, setUser] = useState(null);

    // Inisialisasi cek login sekali saja
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/me", { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                    setAuthState("authenticated");
                } else {
                    setUser(null);
                    setAuthState("unauthenticated");
                }
            } catch {
                setUser(null);
                setAuthState("unauthenticated");
            }
        })();
    }, []);

    // Fungsi update state setelah login/logout
    const login = (userData) => {
        setUser(userData || null);
        setAuthState("authenticated");
    };
    const logout = () => {
        setUser(null);
        setAuthState("unauthenticated");
    };

    return (
        <AuthContext.Provider value={{ authState, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}