import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext.jsx";
import { api } from "../api.js";
import { MONSTER_IMAGES } from "../monsterAssets.js";

export default function GameScreen() {
    const navigate = useNavigate();
    const { user, logout } = useUser();
    const [tasks, setTasks] = useState([]);
    const [draftTitle, setDraftTitle] = useState("");
    const [previewTask, setPreviewTask] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    
    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        refreshTasks();
    }, [user]);

    async function refreshTasks() {
        const { tasks } = await api.listTasks(user.user_id);
        setTasks(tasks);
    }

    async function handleCreateTask(e) {
        e.preventDefault();
        if (!draftTitle.trim()) return;
        
        // 1. Create the task via backend API (returns title, monster, subtasks)
        const task = await api.createTask(user.user_id, draftTitle.trim());
        setDraftTitle("");
        
        // 2. Set as preview task on this screen
        setPreviewTask(task);
        refreshTasks();
    }

    function handleEnterBattlefield() {
        if (!previewTask) return;
        // Navigate to the Battlefield view passing current task state
        navigate("/battlefield", { state: { activeTask: previewTask } });
    }

    function handleLogout() {
        logout();
        navigate("/");
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-diva-gradient flex">
            {/* Sidebar */}
            {sidebarOpen && (
                <aside className="w-64 bg-butter border-r border-ink px-4 py-4 flex-shrink-0">
                    <div className="flex items-center justify-between mb-6">
                        <span className="font-display italic text-lg">A Diva Has Duties</span>
                        <button onClick={() => setSidebarOpen(false)} className="text-sm">{"✘"}</button>
                    </div>

                    <p className="text-xs font-semibold mb-1">Menu</p>
                    <button 
                        onClick={() => setPreviewTask(null)} 
                        className="w-full text-left bg-cream rounded px-3 py-2 mb-6 text-sm hover:bg-butter-dark transition"
                    >
                        Create New Task
                    </button>

                    <p className="text-xs font-semibold mb-1">Recent Tasks</p>
                    <ul className="text-sm space-y-2">
                        {tasks.map((t) => {
                            const finished = t.energy === 0;
                            return (
                                <li key={t.id} className="bg-cream/60 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                                    <button onClick={() => setPreviewTask(t)} className="text-left flex-1 min-w-0">
                                        <p className="truncate font-medium">{t.title}</p>
                                    </button>
                                    {finished && (
                                        <span className="text-xs opacity-60 italic">Defeated</span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </aside>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-y-auto">
                <nav className="flex items-center justify-between px-10 py-6 border-b border-ink/10">
                    {!sidebarOpen && (
                        <button onClick={() => setSidebarOpen(true)} className="text-sm font-bold mr-6">{"☰"}</button>
                    )}
                    <div className="flex gap-8 text-sm font-medium ml-auto">
                        <button onClick={() => navigate("/")} className="hover:text-ink/70 transition">Home</button>
                        <button onClick={() => navigate("/dashboard")} className="hover:text-ink/70 transition">Dashboard</button>
                        <button onClick={handleLogout} className="hover:text-ink/70 transition">Log out</button>
                    </div>
                </nav>

                <div className="flex-1 flex flex-col justify-center items-center w-full pb-10 px-6">
                    {!previewTask ? (
                        /* State 1: Input Field */
                        <div className="px-10 mt-12 max-w-xl text-center w-full">
                            <h1 className="font-display text-4xl mb-6">
                                Hi {user.name}, Let's get started
                            </h1>
                            <form onSubmit={handleCreateTask} className="w-full flex flex-col items-center">
                                <input 
                                    value={draftTitle} 
                                    onChange={(e) => setDraftTitle(e.target.value)} 
                                    placeholder="Enter your task" 
                                    className="w-full bg-cream rounded-xl px-5 py-4 italic shadow outline-none text-center text-lg"
                                />
                                <button 
                                    type="submit" 
                                    className="mt-6 bg-butter hover:bg-butter-dark transition-all rounded-full px-8 py-3 font-medium shadow-lg hover:-translate-y-0.5"
                                >
                                    Summon the monster
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* State 2: Mini-tasks Preview & Enter Battlefield Button */
                        <div className="flex flex-col items-center w-full max-w-5xl">
                            <div className="flex flex-col md:flex-row gap-10 items-center justify-center w-full mb-8">
                                {/* Left Side: Monster & Initial Bar */}
                                <div className="flex-1 flex flex-col items-center text-center">
                                    <img 
                                        src={MONSTER_IMAGES[previewTask.monster.id]} 
                                        alt={previewTask.monster.name} 
                                        className="w-56 h-56 object-contain mb-4 select-none"
                                    />
                                    <p className="font-medium mb-1">Energy Bar</p>
                                    <div className="w-72 h-4 bg-cream rounded-full overflow-hidden border border-ink/20">
                                        <div 
                                            className="h-full bg-skyfog-dark bg-opacity-80 transition-all duration-500" 
                                            style={{ width: `${previewTask.energy}%` }}
                                        />
                                    </div>
                                    <p className="text-xs italic mt-2 max-w-xs opacity-75">
                                        Make the energy bar zero to defeat the monster by completing the mini tasks
                                    </p>
                                </div>

                                {/* Right Side: Mini Task breakdown */}
                                <div className="bg-skyfog/90 backdrop-blur rounded-2xl shadow-xl p-8 w-full max-w-md border border-ink/10">
                                    <h2 className="font-display italic text-3xl mb-6">Task to complete:</h2>
                                    <ul className="space-y-4 text-left">
                                        {previewTask.subtasks?.map((s, i) => (
                                            <li key={i} className="flex items-center gap-3 text-lg">
                                                <span className="w-4 h-4 bg-cream border border-ink/40 rounded-xs flex-shrink-0" />
                                                <span>{s.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <button 
                                onClick={handleEnterBattlefield}
                                className="bg-butter hover:bg-butter-dark font-medium text-lg transition-all rounded-full px-10 py-4 shadow-xl hover:-translate-y-1 active:translate-y-0"
                            >
                                Enter the Battlefield
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}