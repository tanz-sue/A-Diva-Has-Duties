import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext.jsx";
import { api } from "../api.js";
import { WARRIOR_IMAGES, WARRIOR_LABELS } from "../warriorAssets.js";

const FIGHTER_IDS = ["witch_cat", "raccoon_baker", "penguin_wizard"];

export default function CharacterSelect() {
    const navigate = useNavigate();
    const { user, updateUser } = useUser();
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleConfirm() {
        if(!selected || !user ) return;
        setLoading(true);
        try {
            await api.chooseCharacter(user.user_id, selected);
            updateUser({character: selected});
            navigate("/game");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-diva-gradient">
            <nav className="flex items-center justify-between px-10 py-6 border-ink">
                <span className="font-display italic text-xl underline">A Diva Has Duties</span>
                <div className="flex gap-8 text-sm">
                    <span>{user?.name || "User's name"}</span>
                </div>
            </nav>

            <div className="text-center mt-16 px-6">
                <h1 className="font-display text-4xl mb-12">Choose Your Diva Fighter</h1>
                <div className="flex justify-center gap-10 mb-12">
                    {FIGHTER_IDS.map((id) =>(
                        <button key={id} onClick={() => setSelected(id)} onClick={`flex flex-col items-center gap-2 transtion ${selected === id? "scale-105": ""}`}>
                            <span className={`w-32 h-32 rounded-full bg-skyfog overlow-hidden ring-4 ${selected === id? "ring-butter-dark": "ring-transparent"}`}>
                                <img src={WARRIOR_IMAGES[id]} alt={WARRIOR_LABELS[id]} className="w-full h-full object-cover"/>
                            </span>

                            <span className="text-sm font-medium">{WARRIOR_LABELS[id]}</span>
                        </button>
                    ))}
                </div>

                <button onClick={handleConfirm} disabled={!selected || loading} className="bg-cream border-ink rounded-full px-8 py-3 font-medium shadow disabled: opacity-40">
                    {loading ? "Entering...": "Ready to enter battlefield" }
                </button>
            </div>
        </div>
    );
}