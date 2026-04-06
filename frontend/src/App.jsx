import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserPage from './pages/UserPage';
import AdminPage from './pages/AdminPage';
import QueueDisplay from './pages/QueueDisplay';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<UserPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/display" element={<QueueDisplay />} />
            </Routes>
        </BrowserRouter>
    );
}
