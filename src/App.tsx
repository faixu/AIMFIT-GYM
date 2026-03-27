import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicSite from './components/PublicSite';
import AdminPortal from './components/AdminPortal';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route path="/admin-portal" element={<AdminPortal />} />
      </Routes>
    </Router>
  );
}

export default App;
