import React from "react";
import { Link } from "react-router-dom";

export default function NavBar({ active }) {
    const linkClass = (name) =>
        `hover:opacity-70 ${active === name ? "font-semibold underline" : ""}`;

    return(
        <nav className="flex items-center justify-between px-10 py-6">
            <Link to = "/" className="font-display italic text-xl">
            A Diva Has Duties
            </Link>
            <div className="flex gap-8 text-sm items-center">
                <Link to="/" className= {linkClass("about")}>About</Link>
                <Link to="/how-it-works" className={linkClass("how-it-works")}>How it Works</Link>
            </div>
        </nav>
    );
}