import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../UserContext.jsx";
import { api } from "../api.js";
import AppNavBar from "./AppNavBar.jsx";
import { MONSTER_IMAGES } from "../monsterAssets.js";
import { WARRRIOR_IMAGES } from "../warriorAssets.js";

export default function GameScreen() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, updateUser } = useUser();
    const [task, setTasks] = useState();
    const [activeTask, setActiveTask]= useState(null);
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
            const match = tasks.find((t) => t.task_id === resumeTaskId);
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
        setActiveTask(task);
        refreshTasks();
    }

    async function handleToggleSubtask(e) {
        if (!activeTask || activeTask.subtasks[index].done) return;
        const result = await api.completeSubtask(activeTask.task_id, index);
        setActiveTask(result.task);
        updateUser(result.user);
        refreshTasks();

        if (result.level_up) {
            setLevelUpBanner(true);
            setTimeout(() => setLevelUpBanner(false), 2500);
        }
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-diva-gradient flex">
            {sidebarOpen && (
                <aside className="w-64 bg-butter border-r border-ink px-4 py-4 flex-shrink-0">
                    <div className="flex items-center justify-between mb-6">
                        <span className="font-display italic text-lg">A Diva Has Duties</span>
                        <button onClick={() => setSidebarOpen(false)} className="text-sm">{"˂˂"}</button>
                    </div>

                    <p className="text-xs font-semibold mb-1">Menu</p>
                    <button onClick={() => setActiveTask(null)} className="w-full text-left bg-cream rounded px-3 py-2 mb-6 text-sm">Crete New Task</button>

                    <p className="text-xs font-semibold mb-1">Recent</p>
                    <ul className="text-sm space-y-2">
                        {tasks.map((t) => {
                            const finished = t.energy === 0;
                            return (
                                <li key = {t.task_id} className="bg-cream/60 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                                    <button onClick={() => setActiveTask(t)} className="text-left flex-1 min-w-0">
                                        <p className="truncate">{t.title}</p>
                                        <p className={`text-xs ${finished ? "opacity-60" : "font-medium"}`}></p>
                                    </button>
                                    { finished && (
                                        <button onClick={() => setActiveTask(t)} className="text-xs bg-butter-dark rounded-full px-2 py-1 flex-shrink-0" title="Rejoin this battle">Rejoin</button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </aside>
            )}

            <div className="flex-1">
                <div className="flex items-center">
                    {!sidebarOpen && (
                        <button onClick={() => setSidebarOpen(true)} className="text-sm pl-10 pt-6">{"˂˂"}</button>
                    )}
                    <div className="flex-1">
                        <AppNavBar active="home"/>
                    </div>
                </div>

                {levelUpBanner && (
                    <div className="mx-10 mb-4 bg-butter-dark rounded-lg px-4 py-2 text-center font-mediumn flex items-center justify-center gap-2">
                        {user.character && (
                            <img src={WARRRIOR_IMAGES[user.character]} alt="" className="w-6 h-6 rounded-full object-cover"/>
                        )}
                        Level up! Your now level {user.level}
                    </div>
                )}

                {!activeTask ? (
                    <div className="px-10 mt-16 max-w-xl">
                        <h1 className="font-display text-3xl mb-6">
                            Hi {user.name}, Let's get started
                        </h1>
                        <form onSubmit={handleCreateTask}>
                            <input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} placeholder="Enter your task" className="w-full bg-cream rounded-xl px-5 py-4 italic shadow outline-none"/>
                            <button type="submit" className="mt-4 bg-butter-dark rounded-full px-6 py-2 font-medium">Summon the monster</button>
                        </form>
                    </div>
                ): (
                    <div className="px-10 mt-10 flex flex-col md:flex-row gap-10 items-start">
                        <div>
                            <img src={MONSTER_IMAGES[activeTask.monster.id]} alt={activeTask.monster.name} className="w-56 h-56 object contain mb-4 select-none"/>
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
    );
}