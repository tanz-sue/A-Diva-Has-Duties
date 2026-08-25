import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext.jsx";
import { api } from "../api.js";
import AppNavBar from "./AppNavBar.jsx";
import { MONSTER_IMAGES } from "../monsterAssets.js";
import { WARRIOR_IMAGES, WARRIOR_LABELS } from "../warriorAssets.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [progress, setProgress] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    load();
  }, [user]);

  async function load() {
    setLoading(true);
    const [progressData, { tasks }] = await Promise.all([
      api.getProgress(user.user_id),
      api.listTasks(user.user_id),
    ]);
    setProgress(progressData);
    setTasks(tasks);
    setLoading(false);
  }

  if (!user || loading || !progress) {
    return (
      <div className="min-h-screen bg-diva-gradient">
        <AppNavBar active="dashboard" />
        <p className="text-center mt-20 opacity-60">Loading your stats...</p>
      </div>
    );
  }

  const { level, tasks_done_this_level, tasks_required_this_level, last_defeated_monster } = progress;
  const progressPct = Math.round((tasks_done_this_level / tasks_required_this_level) * 100);

  const inProgressTasks = tasks.filter((t) => t.energy > 0);
  const monsterImg = last_defeated_monster ? MONSTER_IMAGES[last_defeated_monster.id] : null;

  return (
    <div className="min-h-screen bg-diva-gradient">
      <AppNavBar active="dashboard" />

      <div className="max-w-2xl mx-auto px-6 pb-16">
        <div className="bg-skyfog rounded-2xl shadow-xl p-8 mt-6">
          <h1 className="font-display text-2xl text-center mb-6">
            Diva Status Overview
          </h1>

          <div className="bg-slate-500/70 rounded-xl px-6 py-4 flex items-center gap-4">
            {user.character && (
              <img
                src={WARRIOR_IMAGES[user.character]}
                alt={WARRIOR_LABELS[user.character]}
                className="w-12 h-12 rounded-full object-cover border-2 border-cream flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <p className="text-cream font-semibold text-lg mb-2">Lv {level}</p>
              <div className="w-full h-4 bg-cream/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-butter transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-cream/80 text-xs mt-1">
                {tasks_done_this_level} / {tasks_required_this_level} battles won toward next level
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-cream to-skyfog rounded-2xl shadow-xl p-8 mt-10 text-center">
          <h2 className="font-display text-2xl mb-6">Last completed battle zone</h2>

          {last_defeated_monster ? (
            <>
              <img
                src={monsterImg}
                alt={last_defeated_monster.name}
                className="w-40 h-40 object-contain mx-auto mb-3"
              />
              <p className="text-sm italic">{last_defeated_monster.name} defeated</p>
            </>
          ) : (
            <p className="text-sm italic opacity-70">
              No monsters defeated yet — finish a task to slay your first one!
            </p>
          )}
        </div>

        {inProgressTasks.length > 0 && (
          <div className="bg-cream rounded-2xl shadow-xl p-6 mt-10">
            <h2 className="font-display text-xl mb-4">Unfinished battles</h2>
            <ul className="space-y-3">
              {inProgressTasks.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between bg-butter rounded-lg px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={MONSTER_IMAGES[t.monster.id]}
                      alt={t.monster.name}
                      className="w-10 h-10 object-contain"
                    />
                    <div>
                      <p className="font-medium text-sm">{t.title}</p>
                      <p className="text-xs opacity-70">{t.energy}% energy remaining</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/game", { state: { resumeTaskId: t.id } })}
                    className="text-xs bg-cream rounded-full px-3 py-1.5 font-medium hover:bg-butter-dark transition"
                  >
                    Continue Battle
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-center mt-10">
          <button
            onClick={() => navigate("/game")}
            className="bg-butter-dark rounded-full px-8 py-3 font-medium"
          >
            Start a New Task
          </button>
        </div>
      </div>
    </div>
  );
}