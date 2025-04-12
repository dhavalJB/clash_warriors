import React, { useState, useEffect } from 'react';
import './style/dashboard.style.css';
import Header from './DashComp/Header';
import Daily from './DashComp/Daily';
import TaptoEarn from './DashComp/TaptoEarn';
import Tutorial from './Tutorial';

function Dashboard({ user, status }) {
  const [loading, setLoading] = useState(true);
  const [isTutorialOpen, setIsTutorialOpen] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Check if the tutorial is already completed (from localStorage)
    if (localStorage.getItem('tutorialDone') === 'true') {
      setIsTutorialOpen(false); // Don't show the tutorial
    }
  }, []);

  const handleClose = () => {
    setIsTutorialOpen(false); // Close tutorial modal
  };

  return (
    <div className="dashboard">
      {loading ? (
        <div>Loading...</div>
      ) : user ? (
        <div>
          <Header user={user} />
          <Daily user={user} />
          <TaptoEarn user={user} />
          {isTutorialOpen && <Tutorial user={user} onClose={handleClose} />}
        </div>
      ) : (
        <div>{status}</div>
      )}
    </div>
  );
}

export default Dashboard;
