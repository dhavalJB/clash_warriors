import React from 'react'
import { useNavigate } from 'react-router-dom'
import './style/daily.style.css'
import { triggerHapticFeedback } from '../tournament/utils/haptic'

function DailyTasks() {
  const navigate = useNavigate()

  // ✅ Combined Handler: Navigation + Haptic Feedback
  const handleNavigation = (path) => {
    triggerHapticFeedback() // ✅ Vibrates when tapped
    navigate(path) // ✅ Navigates to the page
  }

  return (
    <div className="daily-tasks-container">
      {/* Rewards Icon */}
      <div className="daily-task" onClick={() => handleNavigation('/daily-rewards')}>
        <img src="./assets/daily/daily-rewards.avif" alt="Daily Rewards" className="task-icon" />
        <span>Daily Rewards</span>
      </div>

      {/* Missions Icon */}
      <div className="daily-task" onClick={() => handleNavigation('/daily-missions')}>
        <img src="./assets/daily/daily-missions.avif" alt="Daily Missions" className="task-icon" />
        <span>Daily Missions</span>
      </div>

      {/* Battle Icon */}
      <div className="daily-task" onClick={() => handleNavigation('/tournament')}>
        <img src="./assets/daily/daily-battle.avif" alt="Daily Battle" className="task-icon" />
        <span>Daily Battle</span>
      </div>
    </div>
  )
}

export default DailyTasks
