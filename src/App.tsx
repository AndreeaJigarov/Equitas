import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout/AdminLayout';
import { HomePage } from './pages/HomePage/HomePage';
import { HorsesPage } from './pages/HorsesPage/HorsesPage';
import './theme.css';

function App() {
  return (

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<AdminLayout />}>
          <Route path="/horses" element={<HorsesPage />} />
        </Route>
      </Routes>

  );
}

export default App;