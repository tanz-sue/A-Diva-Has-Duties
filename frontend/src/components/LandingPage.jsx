import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar.jsx";
import { WARRIOR_IMAGES } from "../warriorAssets.js";
import { MONSTER_IMAGES } from "../monsterAssets.js";

const FIGHTER_IDS = ["witch_cat", "raccoon_baker", "penguin_wizard"];

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-diva-gradient flex flex-col overflow-x-hidden">
            <NavBar/>

            <header className="flex-1 flex flex-col justify-center items-center text-center px-6">
                <h1 className="font-display italic text-4xl md:text-5xl leading-tight decoration-2 underline-offset-4">
                    Break it. Do it. Done. Your task,
                    <br/>
                    gamified into a legendary adventure
                </h1>
                
                <p className="max-w-xl mx-auto mt-10 text-ink/80">
                    Conquer your to-do list, power your character, and defeat the task
                    monsters. Level up as you turn productivity into power. Simple, 
                    satisfying, and divine.
                </p>    
                 
                <button onClick={() => navigate("/signup")} 
                    className="mt-10 bg-butter hover:bg-butter-dark transition-all duration-300 rounded-full px-8 py-3 font-medium shadow-lg hover:shadow-xl hover:-translate-y-1">
                    Get started
                </button>
            </header>
            
        </div>
    );
}