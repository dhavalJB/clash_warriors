import React, { useEffect, useState } from 'react'
import { realtimeDB } from '../../../firebase'
import { ref, update, get } from 'firebase/database'
import './style/dailymissions.style.css'
import Header from '../Header'
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage'
import { triggerHapticFeedback } from '../../tournament/utils/haptic'
import { showRewardedAd } from '../../tournament/utils/showRewardedAd'

const storage = getStorage() // ✅ Initialize Firebase Storage

const DailyMission = ({ user }) => {
  const [socialTasks, setSocialTasks] = useState([])
  // eslint-disable-next-line no-unused-vars
  const [timer, setTimer] = useState(0)
  const [lastAdAttemptTime, setLastAdAttemptTime] = useState(0)

  useEffect(() => {
    const fetchSocialTasks = async () => {
      const socialRef = ref(realtimeDB, 'socialTasks')
      try {
        const snapshot = await get(socialRef)
        if (snapshot.exists()) {
          const tasksArray = Object.values(snapshot.val())

          // Fetch logo URLs from Firebase Storage
          const tasksWithLogos = await Promise.all(
            tasksArray.map(async (task) => {
              try {
                const logoUrl = await getDownloadURL(
                  storageRef(storage, task.logoPath)
                )
                return { ...task, logoUrl }
              } catch (error) {
                console.error('Error fetching logo:', error)
                return { ...task, logoUrl: '' } // Fallback if error
              }
            })
          )

          setSocialTasks(tasksWithLogos)
        }
      } catch (error) {
        console.error('Error fetching social tasks:', error)
      }
    }

    fetchSocialTasks()
  }, [])

  return (
    <div className="daily-mission-container">
      <Header user={user} />

      {/* Missions Section */}
      <div className="daily-mission-image-section">
        <h3 className="daily-mission-subtitle" style={{ marginBottom: '20px' }}>
          Watch Ads & Earn Coins
        </h3>

        {/* Image Wrapper with Overlay */}
        <div className="daily-mission-image-wrapper">
          <img
            src="./assets/ad-bg.avif"
            alt="Watch Ad"
            onClick={async () => {
              const now = Date.now()
              const secondsSinceLast = (now - lastAdAttemptTime) / 1000

              if (secondsSinceLast < 10) {
                alert(
                  `⏳ Wait ${Math.ceil(10 - secondsSinceLast)}s before watching again`
                )
                return
              }

              setLastAdAttemptTime(now) // Start cooldown immediately

              const success = await showRewardedAd(user?.userId)
              if (success) {
                triggerHapticFeedback()
              }
            }}
            className="daily-mission-ad-image"
            style={{
              cursor:
                (Date.now() - lastAdAttemptTime) / 1000 < 10
                  ? 'not-allowed'
                  : 'pointer',
            }}
          />

          {/* Overlayed Text */}
          <p className="daily-mission-overlay-text">
            {timer > 10 ? `Wait ${timer}s` : 'Click to Earn!'}
          </p>
        </div>
      </div>

      {/* Social Media Section */}

      <div className="daily-mission-social-section">
        <h3 className="daily-mission-subtitle">Follow, Subscribe, Earn!</h3>
        <ul className="daily-mission-social-list">
          {socialTasks.map((task, index) => (
            <li
              key={index}
              className="daily-mission-social-item"
              onClick={() => {
                triggerHapticFeedback()
              }}
            >
              <a
                href={task.link}
                target="_blank"
                rel="noopener noreferrer"
                className="daily-mission-social-card"
              >
                {/* ✅ Left Logo */}
                {task.logoUrl && (
                  <img
                    src={task.logoUrl}
                    alt={task.title}
                    className="daily-mission-social-logo"
                  />
                )}

                {/* ✅ Center: Title & Coins */}
                <div className="daily-mission-social-text-container">
                  <span className="daily-mission-social-title">
                    {task.title}
                  </span>
                  <span className="daily-mission-social-coins">
                    💰 {task.coins} Coins
                  </span>
                </div>
                <img
                  src="/assets/right.png"
                  alt="Right Logo"
                  className="daily-mission-social-right-logo"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default DailyMission
