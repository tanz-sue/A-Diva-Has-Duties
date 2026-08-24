import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../UserContext.jsx";

export default function AppNavBar({ Active }) {
    const navigate = useNavigate();
    const { logout } = useUser();

    const linkClass = (name) =>
        `hover:opacity-70 ${active === name ? "font-semibold underline" : ""}`;

    function handleLogout() {
        logout();
        navigate("/");
    }

    return (
        <nav className="flex items-center justify-between px-10 py-6">
            <Link to ="/game" className = "font-display italic text-xl">A Diva Has Duties</Link>
            <div className="flex gap-8 text-sm">
                <Link to="/game" className= {linkClass("home")}>Home</Link>
                <Link to="/dashboard" className={linkClass("dashboard")}>Dashboard</Link>
                <button onClick={handleLogout}>Log Out</button>
            </div>
        </nav>
    );
}