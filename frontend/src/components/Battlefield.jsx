import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../UserContext.jsx";
import { api } from "../api.js";
import { MONSTER_IMAGES } from "../monsterAssets.js";
import { WARRIOR_IMAGES } from "../warriorAssets.js";

export default function Battlefield() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, updateUser, logout } = useUser();

    const [activeTask, setActiveTask] = useState(location.state?.activeTask || null);
    const [levelUpBanner, setLevelUpBanner] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        if (!activeTask) {
            navigate("/gamescreen");
        }
    }, [user, activeTask, navigate]);

    async function handleToggleSubtask(index) {
        if (!activeTask || activeTask.subtasks[index].done) return;

        const result = await api.completeSubtask(activeTask.id, index);
        setActiveTask(result.task);
        updateUser(result.user);

        if (result.level_up) {
            setLevelUpBanner(true);
            setTimeout(() => setLevelUpBanner(false), 3000);
        }
    }

    function handleLogout() {
        logout();
        navigate("/");
    }

    if (!user || !activeTask) return null;

    return (
        <div className="min-h-screen bg-diva-gradient flex flex-col">
            <nav className="flex items-center justify-between px-10 py-6">
                <span className="font-display italic text-xl">A Diva Has Duties</span>
                <div className="flex gap-8 text-sm font-medium">
                    <button onClick={() => navigate("/")} className="hover:text-ink/70 transition">Home</button>
                    <button onClick={() => navigate("/dashboard")} className="hover:text-ink/70 transition">Dashboard</button>
                    <button onClick={handleLogout} className="hover:text-ink/70 transition">Log out</button>
                </div>
            </nav>

            {levelUpBanner && (
                <div className="mx-10 mb-4 bg-butter-dark rounded-lg px-4 py-2 text-center font-medium flex items-center justify-center gap-2 shadow-md animate-bounce">
                    {user?.character && (
                        <img src={WARRIOR_IMAGES[user.character]} alt="" className="w-6 h-6 rounded-full object-cover"/>
                    )}
                    Level Up! You're now at level {user?.level}
                </div>
            )}

            <div className="flex-1 flex flex-col justify-center items-center w-full pb-16 px-6">
                <div className="px-10 flex flex-col md:flex-row gap-12 items-center justify-center w-full max-w-5xl">
                    <div className="flex-1 flex flex-col items-center text-center">
                        <img 
                            src={MONSTER_IMAGES[activeTask.monster.id]} 
                            alt={activeTask.monster.name} 
                            className={`w-64 h-64 object-contain mb-4 select-none transition-all duration-300 ${activeTask.energy === 0 ? "grayscale opacity-50 scale-95" : "animate-pulse"}`}
                        />
                        <p className="font-medium mb-1 text-lg">Energy Bar</p>
                        <div className="w-72 h-4 bg-cream rounded-full overflow-hidden border border-ink/20 shadow-inner">
                            <div 
                                className="h-full bg-skyfog-dark transition-all duration-500 ease-out" 
                                style={{ width: `${activeTask.energy}%` }}
                            />
                        </div>
                        <p className="text-xs italic mt-2 max-w-xs opacity-75">
                            Make the energy bar zero to defeat {activeTask.monster.name} by completing the mini tasks
                        </p>
                    </div>

                    <div className="bg-skyfog/90 backdrop-blur rounded-2xl shadow-xl p-8 w-full max-w-md border border-ink/10">
                        <h2 className="font-display italic text-3xl mb-6">Task to complete:</h2>
                        <ul className="space-y-4">
                            {activeTask.subtasks.map((s, i) => (
                                <li key={i} className="flex items-start gap-3 text-lg">
                                    <input 
                                        type="checkbox" 
                                        checked={s.done} 
                                        onChange={() => handleToggleSubtask(i)} 
                                        disabled={s.done}
                                        className="mt-1 w-5 h-5 rounded accent-butter cursor-pointer"
                                    />
                                    <span className={s.done ? "line-through opacity-50" : "font-medium"}>
                                        {s.text}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        {activeTask.energy === 0 && (
                            <div className="mt-8 p-4 bg-butter/80 rounded-xl text-center font-medium text-lg">
                                🎉 {activeTask.monster.name} defeated! Great work, Diva!
                            </div>
                        )}
                    </div>
                </div>

                <button 
                    onClick={() => navigate("/gamescreen")}
                    className="mt-12 text-sm text-ink/70 underline hover:text-ink transition"
                >
                    ← Back to Dashboard / Setup
                </button>
            </div>
        </div>
    );
}