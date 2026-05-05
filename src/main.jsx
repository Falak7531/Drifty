import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { GoogleAuthProvider } from "./contexts/GoogleAuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <GoogleAuthProvider>
      <App />
    </GoogleAuthProvider>
  </BrowserRouter>
);
