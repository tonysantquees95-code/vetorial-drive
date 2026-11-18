import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { iniciarTema } from "./ajustes";
import "./index.css";

iniciarTema();
createRoot(document.getElementById("raiz")!).render(<StrictMode><App /></StrictMode>);
