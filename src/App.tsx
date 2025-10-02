import { Routes, Route } from 'react-router-dom';
import CultivatorHomepage from './pages/CultivatorHomepage';
import Dashboard from './pages/Dashboard';
import AllIdentities from './pages/AllIdentities';

function App() {
  return (
    <Routes>
      <Route path="/" element={<CultivatorHomepage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/identities" element={<AllIdentities />} />
    </Routes>
  );
}

export default App;
