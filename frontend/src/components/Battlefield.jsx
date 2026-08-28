import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../UserContext.jsx";
import { api } from "../api.js";
import { MONSTER_IMAGES } from "../monsterAssets.js";

export default function Battlefield() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, updateUser, logout } = useUser();

    // Fallback default task so the battlefield never renders blank
    const fallbackTask = {
        id: "default-task",
        title: "Drafting a mail",
        monster: { id: "monster1", name: "Grumble" },
        energy: 100,
        subtasks: [
            { text: "Draft a mail", done: false },
            { text: "Review the mail", done: false },
            { text: "Text the supervisor for second review", done: false },
            { text: "Send the final email", done: false }
        ]
    };

    const [activeTask, setActiveTask] = useState(
        location.state?.activeTask || fallbackTask
    );

    // Pick a random monster if the task doesn't have one assigned
    useEffect(() => {
        if (!activeTask.monster || !activeTask.monster.id) {
            const monsterKeys = Object.keys(MONSTER_IMAGES);
            const randomMonsterId = monsterKeys[Math.floor(Math.random() * monsterKeys.length)] || "monster1";
            setActiveTask(prev => ({
                ...prev,
                monster: { id: randomMonsterId, name: "Monster" }
            }));
        }
    }, []);

    async function handleToggleSubtask(index) {
        if (!activeTask || activeTask.subtasks[index].done) return;

        // Calculate energy drop based on remaining subtasks
        const totalSubtasks = activeTask.subtasks.length;
        const energyPerSubtask = Math.floor(100 / totalSubtasks);

        const updatedSubtasks = activeTask.subtasks.map((st, i) => 
            i === index ? { ...st, done: true } : st
        );

        const remainingUndone = updatedSubtasks.filter(st => !st.done).length;
        const newEnergy = remainingUndone === 0 ? 0 : Math.max(0, activeTask.energy - energyPerSubtask);

        // Local state update for smooth animation
        setActiveTask(prev => ({
            ...prev,
            energy: newEnergy,
            subtasks: updatedSubtasks
        }));

        // Call backend API if a real task ID exists
        if (api && api.completeSubtask && activeTask.id !== "default-task") {
            try {
                const result = await api.completeSubtask(activeTask.id, index);
                if (result?.user) updateUser(result.user);
            } catch (err) {
                console.error("Failed to sync subtask completion:", err);
            }
        }
    }

    function handleLogout() {
        if (logout) logout();
        navigate("/");
    }
    
    // Function to handle temporary exit
    function handleExitBattlefield() {
        // Navigate back (-1) to the GameScreen to resume later
        navigate(-1);
    }

    const currentMonsterImg = MONSTER_IMAGES[activeTask.monster?.id] || Object.values(MONSTER_IMAGES)[0];

    return (
        <div className="min-h-screen bg-[#F8E2B2] text-[#2D231E] flex flex-col font-sans">
            {/* Header / Navbar matching design */}
            <header className="flex items-center justify-between px-12 py-6">
                <h1 className="font-serif italic text-2xl tracking-wide">A Diva Has Duties</h1>
                <nav className="flex gap-8 text-sm font-medium">
                    <button onClick={() => navigate("/")} className="hover:opacity-75 transition">Home</button>
                    <button onClick={() => navigate("/dashboard")} className="hover:opacity-75 transition">Dashboard</button>
                    <button onClick={handleLogout} className="hover:opacity-75 transition">Log Out</button>
                </nav>
            </header>

            {/* Main Battlefield Canvas */}
            <main className="flex-1 flex items-center justify-center px-12 pb-12">
                <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-12">
                    
                    {/* Left Column: Monster Sprite & Interactive Energy Bar */}
                    <div className="flex-1 flex flex-col items-center max-w-md text-left w-full">
                        <img 
                            src={currentMonsterImg} 
                            alt={activeTask.monster?.name || "Monster"} 
                            className={`w-72 h-72 object-contain mb-8 transition-all duration-300 ${activeTask.energy === 0 ? "grayscale opacity-40 scale-95" : ""}`}
                        />

                        <div className="w-full max-w-sm">
                            <h3 className="text-xl font-medium mb-3">Energy Bar</h3>
                            
                            {/* Energy Bar Track */}
                            <div className="w-full h-8 bg-[#FAF3E0] rounded-full overflow-hidden border border-black/10 shadow-inner p-1">
                                <div 
                                    className="h-full bg-[#6C8EBF] rounded-full transition-all duration-500 ease-out" 
                                    style={{ width: `${activeTask.energy}%` }}
                                />
                            </div>

                            <p className="text-xs italic mt-3 text-black/70 leading-relaxed">
                                Make the energy bar zero to defeat the monster by completing the mini tasks
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Mini Tasks Box matching screen styling */}
                    <div className="bg-gradient-to-b from-[#8FA8DF] to-[#5C72A0] rounded-2xl p-8 w-full max-w-lg shadow-2xl text-white border border-white/20 min-h-[420px] flex flex-col justify-between">
                        <div>
                            {/* Added active task title here */}
                            <h2 className="font-serif italic text-4xl mb-2 tracking-wide drop-shadow-sm">
                                {activeTask.title}
                            </h2>
                            <h3 className="text-lg opacity-90 mb-6 font-medium">Tasks to complete:</h3>
                            
                            <ul className="space-y-4">
                                {activeTask.subtasks.map((s, index) => (
                                    <li 
                                        key={index} 
                                        onClick={() => handleToggleSubtask(index)}
                                        className={`flex items-start gap-4 text-2xl cursor-pointer select-none transition-opacity ${s.done ? "opacity-50 line-through" : "hover:opacity-90"}`}
                                    >
                                        <div className={`mt-1.5 w-5 h-5 flex-shrink-0 rounded-xs border-2 border-white/80 transition-colors ${s.done ? "bg-white" : "bg-white/30"}`} />
                                        <span className="leading-tight">{s.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-8 flex flex-col gap-4">
                            {activeTask.energy === 0 && (
                                <div className="p-4 bg-white/20 backdrop-blur rounded-xl text-center font-bold text-lg border border-white/30 shadow-inner">
                                    Monster Defeated! Task Complete! 🎉
                                </div>
                            )}
                            
                            {/* Added button to exit the battlefield temporarily */}
                            <button 
                                onClick={handleExitBattlefield}
                                className="w-full py-3 bg-black/10 hover:bg-black/20 transition-colors rounded-xl font-medium text-white border border-white/10"
                            >
                                {activeTask.energy === 0 ? "Return to Game Screen" : "Pause & Exit to Game Screen"}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}