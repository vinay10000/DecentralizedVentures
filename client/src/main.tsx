import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  console.log("React initialization started...");
  
  const root = createRoot(rootElement);
  root.render(
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  );
  
  console.log("React initialization completed");
} catch (error) {
  console.error("Initialization error:", error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: system-ui, sans-serif;">
      <h1>React Initialization Error</h1>
      <p>There was an error initializing React:</p>
      <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">
        ${error instanceof Error ? error.message : String(error)}
      </pre>
    </div>
  `;
}
