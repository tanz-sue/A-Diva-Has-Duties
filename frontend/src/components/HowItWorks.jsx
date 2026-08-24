import React from "react";
import NavBar from "./NavBar.jsx";
import WARRIOR_IMAGES from "../warriorAssets.js"
import MONSTER_IMAGES from "../monsterAssets.js";

const FIGHTER_IDS = ["witch_cat", "raccoon_baker", "penguin_wizard"];

export default function HowItWorks() {
    return (
        <div className="min-h-screen bg-diva-gradient">
            <NavBar active="how-it-works" />
            <div className="max-w-5xl mx-auto px-10 py-9 space-y-20">
                <div className="flex flex-col md:flex-row items-center gap-10">
                    <p className="font-display text-lg mb-3">Hi Diva, Let's get started</p> 
                    <div className="bg-cream rounded-lg px-4 py-3 italic text-sm">Enter your task</div>
                </div>

                <p className="text-lg leading-relaxed">
                    Productivity shouldnt feel like a chore; 
                    it shoudl feel like a victory.
                </p>
                <div className="flex flex-col md:flex-row-reverse items-center gap-10">
                    <div className="bg-butter rounded-2xl shadow-xl p-6 w-full md:w-80 flex-shrink-0">
                        <h3 className="font-display text-lg mb-4">Choose Your Diva Fighter</h3>
                        <div className="flex gap-3">
                            {FIGHTER_IDS.map((id) => (
                                <div key={id} className="w-14 h-14 rounded-full bg-skyfog oveflow-hidden">
                                    <img src={WARRIOR_IMAGES[id]} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-center mt-4 bg-cream rounded-full py-2">Ready to enter battlefield</p>
                    </div>
                    <p className="text-lg leading relaxed">
                        A Diva Has Duties is gamified to-do list that transform your 
                        overwhelming tasks into peic, bite-sized battles. Sompy type in 
                        what you need to get done, and our A will automatically break it down 
                        into mangeable steps.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="bg-skyfog rounded-2xl shadow-xl p-6 w-full md:w-80 flex-shrink-0">
                        <img src={MONSTER_IMAGES.beetle_bug} alt="" className="w-16 h-16 object-contain mb-2"/>
                        <h3 className="font-display italic text-lg mb-2">Task to complete:</h3>
                        <ul className="text-sm space-y-1 mb-3">
                            <li>☐ Draft a mail</li>
                            <li>☐ Review the mail</li>
                        </ul>
                        <p className="text-xs font-medium">Enegry Bar</p>
                        <div className="w-full h-2 bg-cream rounded-full mt-1 overflow-hidden">
                            <div className="h-full w-1/2 bg-ink/70"/>
                        </div>
                    </div>
                    <p className="text-lg leading-relaxed">
                        Choose your magical Diva Fighter, face off against procrastination
                        monsters, and check off your subtask to drain their enegry bar.
                        Level Up, conquer your day, and slay your to-do list.
                    </p>
                </div>
            </div>
        </div>
    );
}