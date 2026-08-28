import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext.jsx";
import { api } from "../api.js";
import { MONSTER_IMAGES } from "../monsterAssets.js";

const MONSTER_KEYS = Object.keys(MONSTER_IMAGES);

function normaliseTask(task) {
    if (!task) return null;

    const subtasks = Array.isArray(task.subtasks)
        ? task.subtasks.map((s) =>
              typeof s === "string" ? { text: s, done: false } : { text: s.text, done: !!s.done }
          )
        : [];

    let monster = task.monster;
    if (!monster || !MONSTER_IMAGES[monster.id]) {
        const id = MONSTER_KEYS[Math.floor(Math.random() * MONSTER_KEYS.length)];
        monster = { id, name: monster?.name || id.replace(/_/g, " ") };
    }

    const total = subtasks.length || 1;
    const done = subtasks.filter((s) => s.done).length;
    const energy =
        typeof task.energy === "number" ? task.energy : Math.round((100 * (total - done)) / total);

    return { ...task, subtasks, monster, energy };
}

export default function GameScreen() {
    const navigate = useNavigate();
    const { user, logout } = useUser();
    const [tasks, setTasks] = useState([]);
    const [draftTitle, setDraftTitle] = useState("");
    const [previewTask, setPreviewTask] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        refreshTasks();
    }, [user]);

    async function refreshTasks() {
        if (!user) return;
        try {
            const data = await api.listTasks(user.user_id);
            setTasks((data.tasks || []).map(normaliseTask));
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleCreateTask(e) {
        e.preventDefault();
        if (!draftTitle.trim() || loading) return;

        setLoading(true);
        setError("");
        try {
            const task = normaliseTask(await api.createTask(user.user_id, draftTitle.trim()));
            setDraftTitle("");
            setPreviewTask(task);
            refreshTasks();
        } catch (err) {
            setError(err.message || "Could not summon a monster. Try again.");
        } finally {
            setLoading(false);
        }
    }

    function computeEnergy(subtasks) {
        const total = subtasks.length || 1;
        const done = subtasks.filter((s) => s.done).length;
        return Math.round((100 * (total - done)) / total);
    }

    async function toggleSubtask(index) {
        if (!previewTask) return;

        const subtasks = previewTask.subtasks.map((s, i) =>
            i === index ? { ...s, done: !s.done } : s
        );
        const updated = { ...previewTask, subtasks, energy: computeEnergy(subtasks) };

        // optimistic update so the UI (and the energy bar) reacts instantly
        setPreviewTask(updated);
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

        try {
            if (typeof api.updateTask === "function") {
                await api.updateTask(user.user_id, updated.id, {
                    subtasks: updated.subtasks,
                    energy: updated.energy,
                });
            } else if (typeof api.toggleSubtask === "function") {
                await api.toggleSubtask(user.user_id, updated.id, index);
            }
        } catch (err) {
            setError(err.message || "Could not save that mini task.");
            // roll back on failure
            setPreviewTask(previewTask);
            setTasks((prev) => prev.map((t) => (t.id === previewTask.id ? previewTask : t)));
        }
    }

    function handleEnterBattlefield(task) {
        const target = task || previewTask;
        if (!target) return;
        navigate(`/battlefield/${target.id}`, { state: { activeTask: target } });
    }

    function handleLogout() {
        logout();
        navigate("/");
    }

    if (!user) return null;

    const previewDone = previewTask?.subtasks.filter((s) => s.done).length ?? 0;
    const previewStarted = previewDone > 0;
    const previewFinished = previewTask?.energy === 0;

    return (
        <div className="min-h-screen bg-diva-gradient flex">
            {sidebarOpen && (
                <aside className="w-64 bg-butter border-r border-ink px-4 py-4 flex-shrink-0">
                    <div className="flex items-center justify-between mb-6">
                        <span className="font-display italic text-lg">A Diva Has Duties</span>
                        <button onClick={() => setSidebarOpen(false)} className="text-sm">{"✘"}</button>
                    </div>

                    <p className="text-xs font-semibold mb-1">Menu</p>
                    <button onClick={() => setPreviewTask(null)}
                        className="w-full text-left bg-cream rounded px-3 py-2 mb-6 text-sm hover:bg-butter-dark transition">
                        Create New Task
                    </button>

                    <p className="text-xs font-semibold mb-1">Recent Tasks</p>
                    <ul className="text-sm space-y-2">
                        {tasks.map((t) => {
                            const finished = t.energy === 0;
                            return (
                                <li key={t.id} className="bg-cream/60 rounded-lg px-3 py-2 flex flex-col gap-1">
                                    <button onClick={() => setPreviewTask(t)} className="text-left min-w-0">
                                        <p className="truncate font-medium">{t.title}</p>
                                        <p className="text-[11px] opacity-60">
                                            {finished ? "Defeated" : `${t.subtasks.filter((s) => s.done).length}/${t.subtasks.length} mini tasks`}
                                        </p>
                                    </button>
                                    {!finished && (
                                        <button onClick={() => handleEnterBattlefield(t)} className="self-start text-[11px] underline hover:no-underline opacity-80">
                                            Hop back to the battlefield →
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                        {tasks.length === 0 && (
                            <li className="text-xs italic opacity-60">No duties yet, diva.</li>
                        )}
                    </ul>
                </aside>
            )}

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
                        <div className="px-10 mt-12 max-w-xl text-center w-full">
                            <h1 className="font-display text-4xl mb-6">
                                Hi {user.name}, Let's get started
                            </h1>
                            <form onSubmit={handleCreateTask} className="w-full flex flex-col items-center">
                                <input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} placeholder="Enter your task"
                                    className="w-full bg-cream rounded-xl px-5 py-4 italic shadow outline-none text-center text-lg"/>
                                <button type="submit" disabled={loading}
                                    className="mt-6 bg-butter hover:bg-butter-dark transition-all rounded-full px-8 py-3 font-medium shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0">
                                    {loading ? "Summoning..." : "Summon the monster"}
                                </button>
                            </form>
                            {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center w-full max-w-5xl">
                            <h1 className="font-display italic text-4xl mb-8 text-center">
                                {previewTask.title}
                            </h1>

                            <div className="flex flex-col md:flex-row gap-10 items-center justify-center w-full mb-8">
                                <div className="flex-1 flex flex-col items-center text-center">
                                    <img src={MONSTER_IMAGES[previewTask.monster.id]} alt={previewTask.monster.name}
                                        className={`w-56 h-56 object-contain mb-4 select-none rounded-2xl ${ previewFinished ? "grayscale opacity-40" : ""}`}/>
                                    <p className="font-medium mb-1">Energy Bar</p>
                                    <div className="w-72 h-4 bg-cream rounded-full overflow-hidden border border-ink/20">
                                        <div className="h-full bg-skyfog-dark bg-opacity-80 transition-all duration-500" style={{ width: `${previewTask.energy}%` }}/>
                                    </div>
                                    <p className="text-xs italic mt-2 max-w-xs opacity-75">
                                        Make the energy bar zero to defeat the monster by completing the mini tasks
                                    </p>
                                </div>

                                <div className="bg-skyfog/90 backdrop-blur rounded-2xl shadow-xl p-8 w-full max-w-md border border-ink/10">
                                    <h2 className="font-display italic text-3xl mb-6">Task to complete:</h2>
                                    <ul className="space-y-4 text-left">
                                        {previewTask.subtasks.map((s, i) => (
                                            <li key={i}>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSubtask(i)}
                                                    aria-pressed={s.done}
                                                    className="w-full flex items-center gap-3 text-lg text-left cursor-pointer rounded-lg px-1 py-1 hover:bg-cream/50 transition"
                                                >
                                                    <span className={`w-4 h-4 border border-ink/40 rounded-xs flex-shrink-0 ${ s.done ? "bg-ink/70" : "bg-cream" }`}/>
                                                    <span className={s.done ? "line-through opacity-60" : ""}>
                                                        {s.text}
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {previewFinished ? (
                                <p className="font-medium text-lg">Monster defeated. Go on, pick a new duty 🎉</p>
                            ) : (
                                <button onClick={() => handleEnterBattlefield()}
                                    className="bg-butter hover:bg-butter-dark font-medium text-lg transition-all rounded-full px-10 py-4 shadow-xl hover:-translate-y-1 active:translate-y-0">
                                    {previewStarted ? "Hop back to the Battlefield" : "Enter the Battlefield"}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
