import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/TasksPage";
import MeetingsPage from "./pages/MeetingsPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/meetings" element={<MeetingsPage />} />
      </Routes>
    </Layout>
  );
}

