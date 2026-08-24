import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../UserContext.jsx";
import { api } from "../api.js";
import NavBar from "./NavBar.jsx";

export default function Login(){
    const navigate = useNavigate();
    const { updateUser } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSignIn(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const account = await api.login(email.password);
            updateUser(account);
            navigate(account.character ? "/game": "/character-select");
        } catch (err) {
            setError(err.message || "No account found for that email.Try signing Up instead");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-diva-gradient flex flex-col">
            <NavBar active ="login"/>
            <div className="flex-1 flex items-start justify-center mt-16">
                <form onSubmit={handleSignIn} className="bg-cream rounded-xl shadow-2xl w-96 overflow hidden">
                    <div className="h-3 bg-butter-cream"/>
                    <div className="p-8">
                        <h1 className="font-display text-3xl text-center mb-6">
                            Welcome Back, Diva!
                        </h1>

                        <label className="text-sm font-medium">Email</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-butter rounded-md px-3 py-2 mt-1 mb-4 outline-none"/>
                        <label className="text-sm font-medium">Password</label>
                        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-butter rounded-md px-3 py-2 mt-1 outline-none"/>
                        <button type="button" className="text-xs mt-1 hover:underline">Forget Password?</button>

                        {error && <p className="text-xs text-red-600 mt-3">{error}</p>}

                        <button type="submit" disabled={loading} className="w-full mt-6 border border-ink rounded-ful py-2 font-medium hover:bg-butter transition disabled:opacity-50">
                            {loading ? "Signing in...." : "Sign in"}
                        </button>

                        <p className="text-xs text-center mt-4">New here?{" "}
                            <Link to="/signup" className="underline hover:opacity-70">Create an account</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}