import React from "react";
import ReactDOM from "react-dom/client";
import { BroswerRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BroswerRouter>
        <App/>
        </BroswerRouter>
    </React.StrictMode>
);