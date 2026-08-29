import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Circle } from "lucide-react";
import { useQuests } from "../QuestContent.jsx";
import { MONSTER_IMAGES } from "../monsterAssests.js";
import AppNavBar from "./AppNavBar.jsx";

export default function Battlefield() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getQuest, toggleMiniQuest, setActiveQuestId, questProgress } = useQuests();
  const quest = getQuest(id);

  useEffect(() => {
    if (quest) setActiveQuestId(quest.id);
  }, [quest, setActiveQuestId]);
  
  if(loading) {
    return (
        <div className="min-h-screen bg-butter-dark px-4 py-10">
            <p className="text-ink ma-w-5xl">Loading...</p>
        </div>
    )
  }

  if (!quest) {
    return (
      <div className="min-h-screen bg-butter-dark px-4 py-10">
        <AppNavBar />
        <main className="max-w-3xl mx-auto">
          <p className="text-ink mb-4">That quest doesn&apos;t exist anymore.</p>
          <button onClick={() => navigate("/")} className="rounded-lg px-4 py-2 bg-[#faf3d9] border border-butter text-ink">
            Back to game screen
          </button>
        </main>
      </div>
    );
  }

  const { energyLeft, defeated } = questProgress(quest);
  const monsterImage = MONSTER_IMAGES[quest.monsterName];
  const monsterLabel = quest.monsterName.replace(/_/g, " ")

  return (
    <div className="min-h-screen bg-butter-dark">
      <AppNavBar/>

      <main className="max-w-5xl mx-auto px-4 py-10 grid gap-10 md:grid-cols-2 items-start">
        <div>
          <img src={monsterImage} alt={monsterLabel} className="w-56 h-56 mx-auto md:mx-0 rounded-full object-cover border-4 border-[#e9dcae] mb-8"/>
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="font-serif italic text-xl text-ink">Energy Bar</h3>
            <span className="text-ink font-medium">{energyLeft}%</span>
          </div>
          <div className="h-4 rounded-full bg-[#e9dcae] overflow-hidden mb-3">
            <div className="h-full bg-skyfog transition-all duration-300" style={{ width: `${energyLeft}%` }}/>
          </div>
          <p className="text-sm italic text-ink">
            {defeated ? `${monster.name} has been defeated! Every mini quest is done.`
              : `Make the energy bar zero to defeat ${monster.name} by completing the mini quests.`}
          </p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-skyfog to-darkskyfog p-8 shadow-md">
          <h2 className="font-serif italic text-3xl text-white mb-4">{quest.title}</h2>
          <p className="text-white font-semibold mb-3">Mini quests:</p>

          <ul className="space-y-3 mb-6">
            {quest.miniQuests.map((m) => (
              <li key={m.id}>
                <button onClick={() => toggleMiniQuest(quest.id, m.id)} className="flex items-start gap-3 text-left w-full group">
                  {m.done ? (
                    <CheckCircle2 className="text-white shrink-0 mt-0.5" size={20} />
                  ) : (
                    <Circle className="text-white/80 shrink-0 mt-0.5" size={20} />
                  )}
                  <span
                    className={`text-white ${
                      m.done ? "line-through opacity-70" : "group-hover:opacity-90"
                    }`}
                  >
                    {m.text}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <button onClick={() => navigate("/")} className="w-full rounded-lg px-4 py-3 bg-[#faf3d9] text-ink font-medium hover:bg-[#f0e6c4] transition">
            Pause &amp; exit to game screen
          </button>
        </div>
      </main>
    </div>
  );
}
