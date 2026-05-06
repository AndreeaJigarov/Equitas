import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout/AdminLayout';
import { HomePage } from './pages/HomePage/HomePage';
import { HorsesPage } from './pages/HorsesPage/HorsesPage';
import './theme.css';
import { RegisterPage } from "./pages/AuthPages/RegisterPage.tsx";
import { LoginPage } from "./pages/AuthPages/LoginPage.tsx";
import { StatisticsPage } from "./pages/StatisticsPage/StatisticsPage.tsx";
import { ChatPage } from "./pages/ChatPage/ChatPage.tsx";
import { ProtectedRoute } from './components/AuthComponents/ProtectedRoute';

function App() {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/home" element={<HomePage />} />

            {/* Authenticated area — must be logged in to access */}
            <Route element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                    <Route path="/horses" element={<HorsesPage />} />
                    <Route path="/statistics" element={<StatisticsPage />} />
                    <Route path="/chat" element={<ChatPage />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default App;
