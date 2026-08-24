import React, { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

export function UserProvide({children}) {
    const [user, setUser] = useState(() =>{
        const saved = localStorage.getItem("diva_user");
        return saved ? JSON.parse(saved) : null;
    });

    const updateUser = (patch) => {
        setUser((prev) =>{
            const next = { ...prev, ...patch};
            localStorage.setItem("diiva_user", JSON.stringify(next));
            return next;
        });

    };

    const logout = () => {
        localStorage.removeItem("diva_user");
        setUser(null);
    };

    return (
        <UserContext.Provider value = {{ user, upcdateUser, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error ("useUser must be used inside <UserProvider>");
    return ctx;
}