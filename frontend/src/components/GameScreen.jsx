import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../UserContext.jsx";
import { api } from "../api.js";
import AppNavBar from "./AppNavBar.jsx";
import { MONSTER_IMAGES } from "../monsterAssets.js";
import { WARRIOR_IMAGES } from "../warriorAssets.js";

export default function GameScreen() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, updateUser } = useUser();
    const [tasks, setTasks] = useState([]);
    const [activeTask, setActiveTask]= useState(null);
    const [pendingTask, setPendingTask] = useState(null);
    const [draftTitle, setDraftTitle] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [levelUpBanner, setLevelUpBanner] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        refreshTasks();
    }, [user]);

    useEffect(() => {
        const resumeTaskId = location.state?.resumeTaskId;
        if( resumeTaskId && tasks.length >0) {
            const match = tasks.find((t) => t.id === resumeTaskId);
            if (match) setActiveTask(match);
        }
    }, [tasks, location.state]);

    async function refreshTasks() {
        const { tasks } = await api.listTasks(user.user_id);
        setTasks(tasks);
    }

    async function handleCreateTask(e) {
        e.preventDefault();
        if(!draftTitle.trim()) return;
        const task = await api.createTask(user.user_id, draftTitle.trim());
        setDraftTitle("");
        setPendingTask(task);
        refreshTasks();
    }

    async function handleToggleSubtask(index) {
        if (!activeTask || activeTask.subtasks[index].done) return;
        const result = await api.completeSubtask(activeTask.id, index);
        setActiveTask(result.task);
        updateUser(result.user);
        refreshTasks();

        if (result.level_up) {
            setLevelUpBanner(true);
            setTimeout(() => setLevelUpBanner(false), 2500);
        }
    }

    function handleLogout(){
        logout();
        navigate("/");
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-diva-gradient flex">
            {sidebarOpen && (
                <aside className="w-64 bg-butter border-r border-ink px-4 py-4 flex-shrink-0">
                    <div className="flex items-center justify-between mb-6">
                        <span className="font-display italic text-lg">A Diva Has Duties</span>
                        <button onClick={() => setSidebarOpen(false)} className="text-sm">{"✘"}</button>
                    </div>

                    <p className="text-xs font-semibold mb-1">Menu</p>
                    <button onClick={() => { setActiveTask(null); setPendingTask(null);}} className="w-full text-left bg-cream rounded px-3 py-2 mb-6 text-sm">Create New Task</button>

                    <p className="text-xs font-semibold mb-1">Recent</p>
                    <ul className="text-sm space-y-2">
                        {tasks.map((t) => {
                            const finished = t.energy === 0;
                            return (
                                <li key = {t.id} className="bg-cream/60 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                                    <button onClick={() => { setActiveTask(t); setPendingTask(null);}} className="text-left flex-1 min-w-0">
                                        <p className="truncate">{t.title}</p>
                                        <p className={`text-xs ${finished ? "opacity-60" : "font-medium"}`}></p>
                                    </button>
                                    { finished && (
                                        <button onClick={() => {setActiveTask(t); setPendingTask(null);}} className="text-xs bg-butter-dark rounded-full px-2 py-1 flex-shrink-0" title="Rejoin this battle">Rejoin</button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </aside>
            )}

            <div className="flex-1 flex-col h-screen">
                <div className="flex item-center w-full px-10 py-6">
                    {!sidebarOpen && (
                        <button onClick={() => setSidebarOpen(true)} className="text-sm mr-6">{"三"}</button>
                    )}

                    <div className="flex-1">
                        <nav className="flex items-center justify-between px-10 py-6 border-ink">
                            <div className="flex gap-8 text-sm">
                                <button onClick={() => navigate("/")} className="hover:text-ink/70 transition">Home</button>
                                <button onClick={() => navigate("/dashboard")} className="hover:text-ink/70 transition">Dashboard</button>
                                <button onClick={handleLogout} className="hover: text-ink/70 transition">Log out</button>
                            </div>
                        </nav>
                    </div>
                </div>

                {levelUpBanner && (
                    <div className="mx-10 mb-4 bg-butter-dark rounded-lg px-4 py-2 text-center font-medium flex items-center justify-center gap-2">
                        { user?.character && (
                            <img src={WARRIOR_IMAGES[user.character]} alt="" className="w-6 h-6 rounded-full object-cover"/>
                        )}
                        Level Up! You're now at level {user?.level}
                    </div>
                )}

                <div className="flex-1 flex flex-col justify-center items-center w-full pb-20">
                    
                    {pendingTask && !activeTask ? (
                        <div className="text-center px-6 max-w-xl">
                            <h2 className="font-display text-3xl mb-4">Task Generated!</h2>
                            <div className="bg-skyfog rounded-2xl shadow-md p-6 mb-8">
                                <p className="text-lg">Your task:</p>
                                <p className="font-semibold text-2xl mt-2">{pendingTask.title}</p>
                            </div>
                            <button onClick={() => {setActiveTask(pendingTask); setPendingTask(null);}} 
                            className="bg-butter hover:bg-butter-dark transition-all rounded-full px-8 py-3 shadow-lg hover:-translate-y-1">Enter the Battlefield</button>
                        </div>
                    ): !activeTask ? (

                    <div className="px-10 mt-16 max-w-xl text-center">
                        <h1 className="font-display text-3xl mb-6">
                            Hi {user.name}, Let's get started
                        </h1>
                        <form onSubmit={handleCreateTask} className="w-full flex flex-col items-center">
                            <input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} placeholder="Enter your task" className="w-full bg-cream rounded-xl px-5 py-4 italic shadow outline-none text-center"/>
                            <button type="submit" className="mt-6 bg-butter hover:bg-butter-dark transition-all rounded-full px-8 py-3 font-medium shadow-lg hoevr:-translate-y-1">Summon the monster</button>
                        </form>
                    </div>
                ): (

                    <div className="px-10 flex flex-col md:flex-row gap-10 items-start w-full max-w-5xl">
                        <div className="flex-1 flex flex-col items-center text-center">
                            <img src={MONSTER_IMAGES[activeTask.monster.id]} alt={activeTask.monster.name} className="w-56 h-56 object-contain mb-4 select-none"/>
                            <p className="font-medium mb-1">Energy Bar</p>
                            <div className="w-72 h-3 bg-cream rounded-full overflow-hidden">
                                <div className="h-full bg-ink/70 transition-all duration-500" style= {{width: `${activeTask.energy}%`}}/>
                            </div>
                            <p className="text-xs italic mt-2 max-w-xs">
                                Make the energy bar zero to defeat {activeTask.monster.name} by
                                completing the mini tasks.
                            </p>
                        </div>

                        <div className="bg-skyfog rounded-2xl shadow-xl p-8 w-full max-w-md">
                            <h2 className="font-display italic text-2xl mb-4">Task to complete:</h2>
                            <ul className="space-y-3">
                                {activeTask.subtasks.map((s,i) => (
                                    <li key={id} className="flex items-start gap-3">
                                        <input type="checkbox" checked={s.done} onChange={() => handleToggleSubtask(i)} className="mt-1 w-4 h-4"/>
                                        <span className={s.done ? "line-through opacity-60": ""}>{s.text}</span>
                                    </li>
                                ))}
                            </ul>
                            
                            {activeTask.energy === 0 && (
                                <p className="mt-6 font-medium">
                                    {activeTask.monster.name} defeated! Great Work, Diva.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
    );
}