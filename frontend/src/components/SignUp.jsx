import React, { useState } from "react";
import { useNavigate, Link } from  "react-router-dom";
import { useUser } from "../UserContent.jsx";
import { api } from "../api.js";
import NavBar from "./NavBar.jsx";

export default function SignUp() {
    const navigate = useNavigate();
    const { updateUser } = useUser();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSignUp(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try{
            const account = await api.signup(username, email, password);
            updateUser(account);
            navigate("/character-select");
        } catch (err) {
            setError(err.message || "Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-diva-gradient flex flex-col">
            <NavBar active="signup" />
            <div className="flex-1 flex items-start justify-center mt-16">
                <form onSubmit={handleSignUp} className="bg-cream rounded-xl shadow-2xl w-96 overflow-hidden">
                    <div className="h-3 bg-butter-dark" />
                    <div className="p-8">
                        <h1 className="font-display text-3xl text-center mb-6">Welcome, Diva!</h1>

                        <label className="text-sm font-medium">Username</label>
                        <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-butter rounded-md px-3 py-2 mt-1 mb-4 outline-none" />

                        <label className="text-sm font-medium">Email</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-butter rounded-md px-3 py-2 mt-1 mb-4 outline-none"/>

                        <label className="text-sm font-medium">Password</label>         
                        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-butter rounded-md px-3 py-2 mt-1 outline-none" />

                        {error && <p className="text-xs text-red-600 mt-3">{error}</p>}   

                        <button type="submit" disabled={loading} className="w-full mt-6 border border-ink rounded-full py-2 font-medium hover:bg-butter transition disabled:opacity-50">{loading ? "Signing Up....": "Sign Up"}</button>

                        <p className="text-xs text-center mt-4">Already a Diva?{" "}
                            <Link to="/login" className="underline hover:opacity-70">Sign in instead</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
