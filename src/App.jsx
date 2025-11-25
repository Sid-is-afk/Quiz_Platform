import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import QuizCreator from './pages/QuizCreator';
import HostLobby from './pages/HostLobby';
import PlayerGame from './pages/PlayerGame';
import Leaderboard from './pages/Leaderboard';
import Results from './pages/Results';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="create" element={<QuizCreator />} />
          <Route path="host/lobby" element={<HostLobby />} />
          <Route path="play" element={<PlayerGame />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="results" element={<Results />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
