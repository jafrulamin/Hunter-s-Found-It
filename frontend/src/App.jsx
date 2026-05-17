
import { BrowserRouter, Routes } from "react-router";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <h1>Hunter's FoundIt</h1>
        {/* No routes yet — pages will be added in upcoming phases */}
        <Routes></Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
