import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout/AdminLayout';
import { HomePage } from './pages/HomePage/HomePage';
import { HorsesPage } from './pages/HorsesPage/HorsesPage';
import './theme.css';
import {RegisterPage} from "./pages/AuthPages/RegisterPage.tsx";
import {LoginPage} from "./pages/AuthPages/LoginPage.tsx";

function App() {
  return (

      <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        <Route element={<AdminLayout />}>
          <Route path="/horses" element={<HorsesPage />} />
        </Route>
      </Routes>

  );
}

export default App;