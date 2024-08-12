import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Reacteroids from "./Reacteroids";
import "./style.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
      <Reacteroids />
  </StrictMode>
);
