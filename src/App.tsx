import { Routes, Route } from 'react-router-dom';
import CultivatorHomepage from './pages/CultivatorHomepage';
import { ToastContainer } from './components/Toast';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<CultivatorHomepage />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
