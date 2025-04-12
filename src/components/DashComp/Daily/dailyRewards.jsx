import React, { useState, useEffect } from 'react'
import { getDatabase, ref, get, set } from 'firebase/database'
import './style/dailyRewards.style.css'
import Header from '../Header'

const dailyRewards = [
  { day: 'Day 1', reward: '500 Coins', description: 'Start strong!' },
  { day: 'Day 2', reward: '1000 Coins', description: 'Double the fun!' },
  { day: 'Day 3', reward: '2500 Coins', description: 'Boost your journey!' },
  { day: 'Day 4', reward: '5000 Coins', description: 'Level up!' },
  { day: 'Day 5', reward: '7500 Coins', description: 'Massive bonus!' },
  { day: 'Day 6', reward: '10000 Coins', description: 'Exclusive prize!' },
  { day: 'Day 7', reward: '25000 Coins', description: 'Epic reward!' },
]

const DailyRewards = ({ user }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [claimedToday, setClaimedToday] = useState(false) // Track if today's reward is claimed
  const [loading, setLoading] = useState(true)
  const db = getDatabase()

  useEffect(() => {
    if (!user?.userId) return

    const fetchStreak = async () => {
      try {
        const streakRef = ref(db, `users/${user.userId}/streak`)
        const lastClaimedRef = ref(db, `users/${user.userId}/lastClaimed`)
        const streakSnap = await get(streakRef)
        const lastClaimedSnap = await get(lastClaimedRef)

        const today = new Date().toISOString().split('T')[0] // Get YYYY-MM-DD format

        if (streakSnap.exists() && lastClaimedSnap.exists()) {
          const streak = streakSnap.val()
          const lastClaimed = lastClaimedSnap.val()

          // Check if last claim was today
          if (lastClaimed === today) {
            setClaimedToday(true) // User already claimed today
          }

          // Check if last claim was yesterday
          const lastDate = new Date(lastClaimed)
          const diffDays = Math.floor(
            (new Date(today) - lastDate) / (1000 * 60 * 60 * 24)
          )

          if (diffDays === 1) {
            // Continue streak
            setCurrentIndex(Math.min(streak, 7))
          } else if (diffDays > 1) {
            // Reset streak if the user skipped a day
            await set(streakRef, 0)
            await set(lastClaimedRef, today) // Reset last claimed date
            setCurrentIndex(0)
          }
        } else {
          // Initialize streak at 0 if it doesn't exist
          await set(streakRef, 0)
          await set(lastClaimedRef, today)
          setCurrentIndex(0)
        }
      } catch (error) {
        console.error('Error fetching streak:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStreak()
  }, [user?.userId, db])

  const handleClaim = async () => {
    if (!user?.userId || claimedToday) return // Prevent multiple claims per day

    try {
      setLoading(true)
      const streakRef = ref(db, `users/${user.userId}/streak`)
      const lastClaimedRef = ref(db, `users/${user.userId}/lastClaimed`)
      const snapshot = await get(streakRef)

      const today = new Date().toISOString().split('T')[0] // Get today's date

      if (snapshot.exists()) {
        let streak = snapshot.val()

        if (streak >= 7) {
          streak = 0 // Reset streak after 7 days
        } else {
          streak += 1 // Increment streak
        }

        await set(streakRef, streak)
        await set(lastClaimedRef, today) // Update last claimed date
        setCurrentIndex(streak)
        setClaimedToday(true) // Prevent further claims today
      }
    } catch (error) {
      console.error('Error updating streak:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dailyRewards-containerMain">
      <Header user={user} />
      {loading ? (
        <p>Loading rewards...</p>
      ) : (
        <div className="dailyRewards-container">
          <div
            key={currentIndex}
            className="dailyRewards-centerClock dailyRewards-animate"
          >
            <p>{dailyRewards[currentIndex].day}</p>
            <h2>{dailyRewards[currentIndex].reward}</h2>
            <p className="dailyRewards-rewardDescription">
              {dailyRewards[currentIndex].description}
            </p>
            <button
              className="dailyRewards-claimButton"
              onClick={handleClaim}
              disabled={claimedToday || loading}
            >
              {claimedToday ? 'Already Claimed' : 'Claim Reward'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DailyRewards
