import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "./api";
import { useUser } from "./UserContent"; 

const QuestContext = createContext(null);

export function QuestContentProvider({ children }) {
  const { user } = useUser(); 
  const [quests, setQuests] = useState([]);
  const [activeQuestId, setActiveQuestId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mapTaskToQuest = (task) => ({
    id: task.id,
    title: task.title,
    miniQuests: (task.subtasks || []).map((st, i) => ({ id: i, text: st.text, done: st.done })),
    monsterName: task.monster?.id || "beetle_bug",
    monster: task.monster || { name: "Beetle Bug" },
    energyLeft: task.energy
  });

  const refresh = useCallback(async () => {
    if (!user) {
      setQuests([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.listTasks(user.id || user.user_id);
      setQuests((data.tasks || []).map(mapTaskToQuest));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function createQuest(title) {
    const task = await api.createTask(user.id || user.user_id, title);
    const quest = mapTaskToQuest(task);
    setQuests((prev) => [quest, ...prev]);
    setActiveQuestId(quest.id);
    return quest;
  }

  async function toggleMiniQuest(questId, miniQuestId) {
    // Optimistic update
    setQuests((prev) =>
      prev.map((q) =>
        q.id !== questId
          ? q
          : {
              ...q,
              miniQuests: q.miniQuests.map((m) =>
                m.id === miniQuestId ? { ...m, done: true } : m
              ),
            }
      )
    );
    try {
      const result = await api.completeSubtask(questId, miniQuestId);
      const updatedQuest = mapTaskToQuest(result.task);
      setQuests((prev) => prev.map((q) => (q.id === questId ? updatedQuest : q)));
    } catch (err) {
      setError(err.message);
      refresh();
    }
  }

  async function deleteQuest(questId) {
    const prevQuests = quests;
    setQuests((prev) => prev.filter((q) => q.id !== questId));
    setActiveQuestId((prev) => (prev === questId ? null : prev));
    try {
      // Backend does not have a delete endpoint, so we simulate it or ignore
      // await api.api.deleteTask(questId);
    } catch (err) {
      setError(err.message);
      setQuests(prevQuests);
    }
  }

  function getQuest(questId) {
    return quests.find((q) => String(q.id) === String(questId)) || null;
  }

  function questProgress(quest) {
    const total = quest.miniQuests.length;
    const done = quest.miniQuests.filter((m) => m.done).length;
    const energyLeft = total === 0 ? 0 : Math.round(((total - done) / total) * 100);
    return { total, done, energyLeft, defeated: total > 0 && done === total };
  }

  const value = {
    quests,
    activeQuestId,
    setActiveQuestId,
    loading,
    error,
    refresh,
    createQuest,
    toggleMiniQuest,
    deleteQuest,
    getQuest,
    questProgress,
  };

  return <QuestContext.Provider value={value}>{children}</QuestContext.Provider>;
}

export function useQuests() {
  const ctx = useContext(QuestContext);
  if (!ctx) throw new Error("useQuests must be used inside a QuestContentProvider");
  return ctx;
}
