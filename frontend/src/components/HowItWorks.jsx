import React from "react";
import NavBar from "./NavBar.jsx";
import { WARRIOR_IMAGES } from "../warriorAssests.js";
import { MONSTER_IMAGES } from "../monsterAssests.js";

const FIGHTER_IDS = ["witch_cat", "raccoon_baker", "penguin_wizard"];

export default function HowItWorks() {
    return (
        <div className="min-h-screen bg-diva-gradient">
            <NavBar active="how-it-works" />
            <div className="max-w-6xl mx-auto px-10 py-16 space-y-32">

                <div className="flex flex-col md:flex-row items-center gap-16">
                    <div className="w-full md:w-1/2 flex justify-center">
                        <div className="bg-darkskyfog rounded-lg p-2 w-full max-w-md shadow-[12px_12px_0px_rgba(156,163,175,0.7)]">
                            <div className=" bg-skyfog rounded-md pb-7 p-8 h-full flex flex-col items-center">
                                <h3 className="font-display pt-9 text-xl mb-6">Hi Diva, Let's get started</h3>
                                <div className="bg-cream rounded-full italic  mb-9 px-6 py-3 text-center text-sm w-3/4 shadow-sm">
                                    Enter Your Task
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-1/2">
                        <p className="text-2xl font-display leading-relaxed">
                            Productivity shouldn't feel like a chore;<br/>
                            it should feel like a victory.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col-reverse md:flex-row items-center gap-16">
                    <div className="w-full md:w-1/2">
                        <p className="text-xl leading-relaxed">
                            A Diva Has Duties is a gamified to-do list that transforms your 
                            overwhelming tasks into epic, bite-sized battles. Simply type in 
                            what you need to get done, and our AI will automatically break it down 
                            into manageable steps.
                        </p>
                    </div>
                    <div className="w-full md:w-1/2 flex justify-center">
                        <div className="bg-butter rounded-lg p-2 w-full max-w-md shadow-[12px_12px_0px_rgba(156,163,175,0.7)]">
                            <div className="bg-cream rounded-md p-8 h-full flex flex-col items-center">
                                <h3 className="font-display text-xl mb-6">Choose your Diva Fighter</h3>
                                <div className="flex gap-6 justify-center mb-6">
                                    {FIGHTER_IDS.map((id) => (
                                        <div key={id} className="w-16 h-16 rounded-full overflow-hidden">
                                            <img src={WARRIOR_IMAGES[id]} alt="" className="w-full h-full object-cover hover:scale-110 transition-transform" />
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-butter rounded-full px-6 py-2 text-xs text-center font-medium shadow-sm">
                                    Ready to enter battlefield
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-16">
                    <div className="w-full md:w-1/2 flex justify-center">
                        <div className="bg-darkskyfog rounded-lg p-2 w-full max-w-md shadow-[12px_12px_0px_rgba(156,163,175,0.7)]">
                            <div className="bg-skyfog rounded-md pb-7 p-8 h-full flex flex-row items-start gap-6">
                                <div className="w-1/3 flex flex-col items-center pt-2">
                                    <img src={MONSTER_IMAGES.beetle_bug} alt="beetle_bug" className="w-24 h-24 object-contain mb-4 drop-shadow-md"/>
                                    <p className="text-xs font-medium w-full text-left mb-1">Energy Bar</p>
                                    <div className="w-full h-3 bg-cream rounded-full overflow-hidden shadow-inner">
                                        <div className="h-full w-2/3 bg-darkskyfog/70"/>
                                    </div>
                                    <p className="text-[8px] text-black/60 mt-2 italic text-center leading-tight">
                                        Drain the energy bar entirely by successfully completing the mini tasks 
                                    </p>
                                </div>
                                <div className="w-2/3">
                                    <h3 className="italic text-lg mb-4 font-display">Task to complete:</h3>
                                    <ul className="text-sm space-y-2">
                                        <li className="flex gap-2 items-start"><span className="text-cream text-lg leading-none">☐</span> Nomenclature & Functional Groups</li>
                                        <li className="flex gap-2 items-start"><span className="text-cream text-lg leading-none">☐</span> Stereochemistry & Isomerism</li>
                                        <li className="flex gap-2 items-start"><span className="text-cream text-lg leading-none">☐</span> Core Reactions & Mechanisms</li>
                                        <li className="flex gap-2 items-start"><span className="text-cream text-lg leading-none">☐</span> Retrosynthesis & Practice Exams</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-1/2">
                        <p className="text-xl leading-relaxed">
                            Choose your magical Diva Fighter, face off against procrastination
                            monsters, and check off your subtasks to drain their energy bar.
                            Level up, conquer your day, and slay your to-do list!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}