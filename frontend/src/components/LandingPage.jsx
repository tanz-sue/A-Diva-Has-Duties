import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar.jsx";
import { WARRRIOR_IMAGES } from "../warriorAssets.js";

const FIGHTER_IDS = ["witch_cat", "raccoon_baker", "penguin_wizard"];

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className = "min-h-screen bg-diva-gradient flex flex-col">
            <NavBar/>

            <header className="text-center mt-10 px-6">
                <h1 className="font-display italic text-4xl md: text-5xl leading-tight underline decoration-2 underline-offset-4">
                    Break it. Do it. Done. Your task,
                    <br/>
                    gamified into a legendry adventure
                </h1>
                <p className="max-w-xl mx-auto mt-6 text-ink/80">
                Conquer your to-do list, power you character, and defeat the task
                monsters.Level up as you turn productivity into power. Simple, 
                satisfying, and divine.
                </p>
                <button onClick={() => navigate("/signup")} className="mt-8 bg-butter hover:bg-butter-dark transition rounded-full px-8 py-3 font-medium shadow">Get started</button>
            </header>

            <div className="relative flex-1 max-w-4xl mx-auto mt-16 mb-10 w-full px-6">
                <div className="bg-butter rounded-2xl shadow-xl p-6 w-72 absolute left-0">
                    <h3 className="font-display text-lg mb-4">Choose Your Diva Fighter</h3>
                    <div className="flex gap-3">
                        {FIGHTER_IDS.map((id) => (
                            <div key={id} className="w-16 h-16 rounded-full bg-skyfog flex items-center justify-center text-2xl">
                                <img src={WARRRIOR_IMAGES[id]} alt ="" className="w-full h-full object-cover"/>
                            </div> 
                        ))}
                    </div>
                    <p className="text-xs text-center mt-4 bg-cream rounded-full py-2">Ready to enter battlefield</p>
                </div>
                <div className="bg-skyfog rounded-2xl shadown -xl p-6 w-80 absolute left-56 top-16 ">
                    <h3 className="font-display italic text-lg mb-3">Tasks to complete:</h3>
                    <ul className="text-sm space-y-1 mb-4">
                        <li>☐ Draft a mail</li>
                        <li>☐ Review the mail</li>
                        <li>☐ Text the supervisor for second review</li>
                    </ul>
                    <p className="text-xs font-medium">Energy Bar</p>
                    <div className="w-full h-2 bg-cream rounded-full mt-1 overflow-hidden">
                        <div className="h-full w-2/3 bg-ink/70" />
                    </div>
                </div>
            </div>
        </div>
        
    );
}