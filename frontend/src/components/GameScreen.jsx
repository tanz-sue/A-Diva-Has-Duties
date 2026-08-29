import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swords, Trash2 } from "lucide-react";
import { useQuests } from "../QuestContent";
import { MONSTER_IMAGES } from "../monsterAssests.js";
import AppNavBar from "./AppNavBar";

export default function GameScreen() {
  const [input, setInput] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const {
    quests,
    activeQuestId,
    setActiveQuestId,
    createQuest,
    deleteQuest,
    getQuest,
    questProgress,
  } = useQuests();

  const activeQuest = activeQuestId ? getQuest(activeQuestId) : null;

  async function handleCreate(e) {
    e.preventDefault();
    const title = input.trim();
    if (!title || creating) return;
    setCreating(true);
    try {
      await createQuest(title);
      setInput("");
    } finally {
      setCreating(false);
    }
  }

  function enterBattlefield(questId) {
    setActiveQuestId(questId);
    navigate(`/battlefield/${questId}`);
  }

  function handleDelete(questId) {
    deleteQuest(questId);
  }

  return (
    <div className="min-h-screen bg-[#f2e2ae]">
      <Header />

      <main className="max-w-3xl mx-auto px-4 pb-16">
        <h2 className="font-serif italic text-4xl text-[#3a3226] mb-3">
          What are we defeating today?
        </h2>
        <p className="text-[#5b5342] mb-6 max-w-xl">
          Type a task. It gets broken into mini quests and a monster is assigned to
          guard it. Each mini quest you tick drains the monster&apos;s energy.
        </p>

        <form onSubmit={handleCreate} className="flex gap-3 mb-8">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Draft the client email"
            className="flex-1 rounded-lg px-4 py-3 bg-[#faf3d9] border border-[#e3d5a0] text-[#3a3226] placeholder:text-[#9c916f] focus:outline-none focus:ring-2 focus:ring-[#7c93c8]"
          />
          <button
            type="submit"
            className="rounded-lg px-6 py-3 bg-[#8b8378] text-white font-medium hover:bg-[#777065] transition"
          >
            Create quest
          </button>
        </form>

        {activeQuest && (
          <div className="rounded-2xl p-6 mb-10 flex items-center justify-between bg-gradient-to-br from-[#8fa3d6] to-[#6c7fb0] shadow-md">
            <div>
              <p className="uppercase text-xs tracking-wide text-[#e4e9f7] mb-1">
                Battle in progress
              </p>
              <p className="font-serif italic text-2xl text-white mb-1">
                {activeQuest.title}
              </p>
              <p className="text-sm text-[#e4e9f7]">
                {questProgress(activeQuest).done} of {questProgress(activeQuest).total}{" "}
                mini quests done · {questProgress(activeQuest).energyLeft}% energy left
              </p>
            </div>
            <button
              onClick={() => navigate(`/battlefield/${activeQuest.id}`)}
              className="flex items-center gap-2 rounded-lg px-4 py-2 bg-[#faf3d9] text-[#3a3226] font-medium hover:bg-[#f0e6c4] transition shrink-0"
            >
              <Swords size={16} />
              Hop back to battlefield
            </button>
          </div>
        )}

        <h3 className="font-serif italic text-2xl text-[#3a3226] mb-4">Your quests</h3>

        {quests.length === 0 && (
          <p className="text-[#5b5342]">No quests yet — create one above to begin.</p>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          {quests.map((quest) => {
            const { done, total, energyLeft } = questProgress(quest);
            const started = done > 0;
            return (
              <div
                key={quest.id}
                className="rounded-2xl bg-[#faf3d9] border border-[#e9dcae] p-5"
              >
                <div className="flex items-start gap-3 mb-3">
                  <MonsterAvatar monster={quest.monster} />
                  <div>
                    <p className="font-serif text-lg font-semibold text-[#3a3226]">
                      {quest.title}
                    </p>
                    <p className="text-xs text-[#7c93c8]">
                      Guarded by {quest.monster.name}
                    </p>
                  </div>
                </div>

                {started && (
                  <div className="h-1.5 rounded-full bg-[#e9dcae] mb-3 overflow-hidden">
                    <div
                      className="h-full bg-[#7c93c8] transition-all"
                      style={{ width: `${100 - energyLeft}%` }}
                    />
                  </div>
                )}

                <ul className="mb-4 space-y-1">
                  {quest.miniQuests.map((m) => (
                    <li
                      key={m.id}
                      className={`text-sm ${
                        m.done ? "line-through text-[#a89f86]" : "text-[#5b5342]"
                      }`}
                    >
                      {m.text}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => enterBattlefield(quest.id)}
                    className="rounded-lg px-4 py-2 bg-[#6c7fb0] text-white text-sm font-medium hover:bg-[#5c6ea0] transition"
                  >
                    {started ? "Revisit battlefield" : "Enter the battlefield"}
                  </button>
                  <button
                    onClick={() => handleDelete(quest.id)}
                    aria-label={`Delete ${quest.title}`}
                    className="text-[#5b5342] hover:text-red-600 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
