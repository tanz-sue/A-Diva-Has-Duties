import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as api from "./api";
import { useUser } from "./UserContent"; 

const QuestContext = createContext(null);

export function QuestContentProvider({ children }) {
  const { session } = useUser(); 
  const [quests, setQuests] = useState([]);
  const [activeQuestId, setActiveQuestId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!session) {
      setQuests([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchQuests();
      setQuests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function createQuest(title) {
    const quest = await api.createQuest(title);
    setQuests((prev) => [quest, ...prev]);
    setActiveQuestId(quest.id);
    return quest;
  }

  async function toggleMiniQuest(questId, miniQuestId) {
    setQuests((prev) =>
      prev.map((q) =>
        q.id !== questId
          ? q
          : {
              ...q,
              miniQuests: q.miniQuests.map((m) =>
                m.id === miniQuestId ? { ...m, done: !m.done } : m
              ),
            }
      )
    );
    try {
      const updated = await api.toggleMiniQuest(questId, miniQuestId);
      setQuests((prev) => prev.map((q) => (q.id === questId ? updated : q)));
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
      await api.deleteQuest(questId);
    } catch (err) {
      setError(err.message);
      setQuests(prevQuests);
    }
  }

  function getQuest(questId) {
    return quests.find((q) => q.id === questId) || null;
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
