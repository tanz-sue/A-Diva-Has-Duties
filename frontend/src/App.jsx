import React from "react";
import { Routes, Route } from "react-router-dom";
import { UserProvider } from "./UserContent.jsx";
import LandingPage from "./components/LandingPage.jsx";
import Login from "./components/Login.jsx";
import SignUp from "./components/SignUp.jsx";
import HowItWorks from "./components/HowItWorks.jsx";
import CharacterSelect from "./components/CharacterSelect.jsx";
import GameScreen from "./components/GameScreen.jsx";
import Battlefield from "./components/Battlefield.jsx";
import Dashboard from "./components/Dashboard.jsx";
import { QuestContentProvider } from "./QuestContent.jsx";
export default function App() {
    return (
        <UserProvider>
            <QuestContentProvider>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    <Route path="/character-select" element={<CharacterSelect />} />
                    <Route path="/game" element={<GameScreen />} />
                    <Route path="/battlefield" element={<Battlefield />} />
                    <Route path="/battlefield/:taskId" element={<Battlefield />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </QuestContentProvider>
        </UserProvider>
    );
}
