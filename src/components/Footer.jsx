import React from 'react'
import { Link } from 'react-router-dom'
import { triggerHapticFeedback } from './tournament/utils/haptic'
import './style/footer.css'

const Footer = () => {
  return (
    <div className="footer-container">
      <div className="footer-buttons">
        <Link to="/">
          <img src="/assets/footer/stats.ft.png" alt="Stats" className="footer-icon" onClick={triggerHapticFeedback} />
        </Link>
        <Link to="/collections">
          <img src="/assets/footer/collection.ft.png" alt="Collections" className="footer-icon" onClick={triggerHapticFeedback} />
        </Link>
        <Link to="/tournament">
          <img src="/assets/footer/tournament.ft.png" alt="Tournament" className="footer-icon" onClick={triggerHapticFeedback} />
        </Link>
        <Link to="/friends">
          <img src="/assets/footer/friends.ft.png" alt="Friends" className="footer-icon" onClick={triggerHapticFeedback} />
        </Link>
        <Link to="/airdrop">
          <img src="/assets/footer/airdrop.ft.png" alt="Airdrop" className="footer-icon" onClick={triggerHapticFeedback} />
        </Link>
      </div>
    </div>
  )
}

export default Footer
