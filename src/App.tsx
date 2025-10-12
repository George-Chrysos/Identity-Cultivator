import { Routes, Route } from 'react-router-dom';
import CultivatorHomepage from './pages/CultivatorHomepage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<CultivatorHomepage />} />
    </Routes>
  );
}

export default App;
