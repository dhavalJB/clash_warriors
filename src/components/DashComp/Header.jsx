import React, { useEffect, useState } from 'react'
import { getDatabase, ref, onValue, get, update } from 'firebase/database'
import './style/header.style.css'
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react'
import { triggerHapticFeedback } from '../tournament/utils/haptic'

// Format numbers (K, M, B)
const formatNumber = (num) => {
  if (num >= 1_000_000_000) return Math.floor(num / 1_000_000_000) + 'B'
  if (num >= 1_000_000) return Math.floor(num / 1_000_000) + 'M'
  if (num >= 1_000) return Math.floor(num / 1_000) + 'K'
  return num.toString()
}

// Get color based on progress percentage
const getProgressColor = (percentage) => {
  if (percentage <= 10) return '#ff0000' // Red
  if (percentage <= 30) return '#ff6600' // Orange
  if (percentage <= 50) return '#ffcc00' // Yellow
  if (percentage <= 70) return '#4caf50' // Green
  if (percentage <= 90) return '#2196f3' // Blue
  return '#9c27b0' // Purple
}

// Calculate level based on XP
const calculateLevel = (xp) => {
  if (xp <= 100) return 1
  if (xp <= 250) return 2
  if (xp <= 500) return 3
  if (xp <= 1000) return 4
  if (xp <= 2000) return 5
  return Math.floor(Math.log(xp) * 10)
}

// Calculate progress within the level
const calculateProgress = (xp, level) => {
  let minXp, maxXp
  if (level === 1) {
    minXp = 0
    maxXp = 100
  } else if (level === 2) {
    minXp = 101
    maxXp = 250
  } else if (level === 3) {
    minXp = 251
    maxXp = 500
  } else if (level === 4) {
    minXp = 501
    maxXp = 1000
  } else if (level === 5) {
    minXp = 1001
    maxXp = 2000
  } else {
    minXp = 2001
    maxXp = xp
  }
  const progress = ((xp - minXp) / (maxXp - minXp)) * 100
  return Math.min(progress, 100)
}

const calculateRank = (level) => {
  if (level < 1) return 'Unranked'

  const ranks = [
    'Bronze I',
    'Bronze II',
    'Bronze III',
    'Bronze IV',
    'Silver I',
    'Silver II',
    'Silver III',
    'Silver IV',
    'Gold I',
    'Gold II',
    'Gold III',
    'Gold IV',
    'Platinum',
    'Emerald',
    'Sapphire',
    'Ruby',
    'Diamond',
    'Master',
    'Grandmaster',
    'Immortal',
  ]

  const levelsPerRank = 5 // Each rank covers 5 levels

  return ranks[
    Math.min(Math.floor((level - 1) / levelsPerRank), ranks.length - 1)
  ]
}

function Header({ user }) {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tonConnectUI] = useTonConnectUI()
  const wallet = useTonWallet()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showConnectedPopup, setShowConnectedPopup] = useState(false)

  useEffect(() => {
    if (!user?.userId) return

    const db = getDatabase()
    const userRef = ref(db, `users/${user.userId}`)

    // Real-time listener for user data
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserData(snapshot.val())
      } else {
        console.warn('User data not found')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user?.userId])

  const handleWalletClick = () => {
    if (wallet?.account?.address) {
      // If wallet is already connected, show dropdown
      setShowDropdown(true)
      setTimeout(() => setShowDropdown(false), 3000) // Hide dropdown after 3 seconds
    } else {
      // If not connected, open TonConnect UI
      tonConnectUI.openModal()
    }
  }

  useEffect(() => {
    if (wallet?.account?.address && user?.userId) {
      const db = getDatabase()
      const walletRef = ref(db, `users/${user.userId}/wallet`)

      get(walletRef).then((snapshot) => {
        if (!snapshot.exists() || !snapshot.val()[1]) {
          // ✅ Only show the popup if wallet was NOT stored before
          update(walletRef, { 1: wallet.account.address }) // Save under [1]: walletAddress
            .then(() => {
              console.log('✅ Wallet address saved to Firebase')
              setShowConnectedPopup(true) // Show for 3 seconds
              setTimeout(() => setShowConnectedPopup(false), 3000)
            })
            .catch((error) =>
              console.error('❌ Error saving wallet address:', error)
            )
        }
      })
    }
  }, [wallet, user?.userId])

  const handleLeaderboardClick = () => {
    window.location.href = '/leaderboard'
    triggerHapticFeedback()
  }

  if (loading) return <p>Loading...</p>

  const xp = userData?.xp || 0
  const level = calculateLevel(xp)
  const progress = calculateProgress(xp, level)
  const progressColor = getProgressColor(progress)
  const formattedPPH = formatNumber(userData?.pph || 0)
  const userRank = calculateRank(level, xp)

  return (
    <div className="dash-header">
      {/* Left Section */}
      <div className="dash-header__left">
        <img
          src={userData?.photo_url || 'default-avatar.png'}
          className="dash-header__avatar"
          alt="Avatar"
        />
        <div className="dash-header__details">
          <div className="dash-header__name">
            {userData?.username ||
              userData?.first_name + ' ' + userData?.last_name}
          </div>
          <div className="dash-header__level">Level: {level}</div>
          <div className="dash-header__level-bar">
            <div
              className="dash-header__level-progress"
              style={{
                width: `${progress}%`,
                backgroundColor: progressColor,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="dash-header__right">
        <div className="dash-header__profit">
          <span>
            <img
              src="/assets/walletIcon.png"
              alt="Wallet"
              className="wallet-icon"
              onClick={handleWalletClick}
            />
            PPH: {formattedPPH} / Hr
          </span>

          {showDropdown && (
            <div className="wallet-dropdown">
              <p>Wallet Connected ✅</p>
              <p>
                {wallet.account.address.slice(0, 6)}...
                {wallet.account.address.slice(-4)}
              </p>
            </div>
          )}
        </div>

        <div className="dash-header__leaderboard">
          <span>{userRank}</span>
          <img
            src="/assets/leaderboardIcon.png"
            alt="Leaderboard"
            className="leaderboard-icon"
            onClick={handleLeaderboardClick}
          />
        </div>
      </div>

      {showConnectedPopup && (
        <div className="connected-popup">
          <p>Wallet Connected Successfully! ✅</p>
        </div>
      )}
    </div>
  )
}

export default Header
