import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreatePost from "./pages/CreatePost";
import Profile from "./pages/Profile";
import EditPost from "./pages/EditPost";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-post/:id" element={<EditPost />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
