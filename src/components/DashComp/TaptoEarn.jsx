import React, { useEffect, useState, useRef } from 'react'
import { ref, get, update, onValue } from 'firebase/database'
import { realtimeDB } from '../../firebase'
import ArcReactor from './Reactor'
import './style/taptoearn.style.css'
import { triggerHapticFeedback } from '../tournament/utils/haptic'

const TapToEarn = ({ user }) => {
  const [userData, setUserData] = useState(null)
  const [tapped, setTapped] = useState(0)
  const [taps, setTaps] = useState(0)
  const [coinAdd, setCoinAdd] = useState(10) // Starting value
  const [coins, setCoins] = useState(0)
  const [usedRefills, setUsedRefills] = useState(0)
  const [maxRefills, setMaxRefills] = useState(0)
  const [refillCost, setRefillCost] = useState(0)
  const [coinAddLevel, setCoinAddLevel] = useState(1) // Starting at level 1
  const [coinAddCost, setCoinAddCost] = useState(500) // Starting cost
  const [coinAddUpdates, setCoinAddUpdates] = useState(0) // Track number of updates
  const userId = user.userId
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null) // Reference for the dropdown menu

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = ref(realtimeDB, `users/${userId}`)
        const snapshot = await get(userRef)

        if (snapshot.exists()) {
          const data = snapshot.val()
          setUserData(data)
          setTapped(data.tapped)
          setTaps(data.taps)
          setCoinAdd(data.coinAdd || 10) // Default 10
          setCoins(data.coins)
          setUsedRefills(data.usedRefills)
          setMaxRefills(data.maxRefills)
          setRefillCost(data.refillCost || 100)
          setCoinAddLevel(data.coinAddLevel || 1) // Default level 1
          setCoinAddCost(data.coinAddCost || 500) // Default cost 500
          setCoinAddUpdates(data.coinAddUpdates || 0) // Default updates 0
        } else {
          console.log('No user found in Realtime Database')
        }
      } catch (error) {
        console.error('Error fetching user data from Realtime DB:', error)
      }
    }

    fetchUserData()
  }, [userId])

  useEffect(() => {
    // Real-time listener for coins updates
    const userRef = ref(realtimeDB, `users/${userId}/coins`)
    const unsubscribe = onValue(userRef, (snapshot) => {
      const newCoins = snapshot.val()
      if (newCoins !== null) {
        setCoins(newCoins)
      }
    })

    // Cleanup listener on component unmount
    return () => {
      unsubscribe() // Unsubscribe when component is unmounted
    }
  }, [userId])

  const handleIncreaseCoinAdd = async () => {
    triggerHapticFeedback
    if (coinAddLevel < 20) {
      // Limiting max level to 20
      const newCoinAdd = coinAdd + 750 // Increase coinAdd by 10
      const newCoinAddLevel = coinAddLevel + 1 // Increase level by 1
      const newCoinAddCost = Math.floor(coinAddCost * 1.5) // Increase cost by 25%

      if (coins >= coinAddCost) {
        const newCoins = coins - coinAddCost // Deduct cost from coins

        try {
          setCoinAdd(newCoinAdd) // Update coinAdd
          setCoinAddLevel(newCoinAddLevel) // Update coinAdd level
          setCoinAddCost(newCoinAddCost) // Update coinAdd cost
          setCoins(newCoins) // Update remaining coins
          setCoinAddUpdates(coinAddUpdates + 1) // Increment update count

          const userRef = ref(realtimeDB, `users/${userId}`)
          await update(userRef, {
            coinAdd: newCoinAdd,
            coinAddLevel: newCoinAddLevel,
            coinAddCost: newCoinAddCost,
            coins: newCoins,
            coinAddUpdates: coinAddUpdates + 1, // Update the count of updates
          })
        } catch (error) {
          console.error('Error increasing coinAdd in Realtime DB:', error)
        }
      } else {
        console.log('Not enough coins to upgrade coinAdd!')
      }
    } else {
      console.log('Maximum coinAdd level reached!')
    }
  }

  const toggleDropdown = () => {
    triggerHapticFeedback
    setShowDropdown((prev) => !prev)
  }

  const handleTap = async () => {
    triggerHapticFeedback
    if (tapped > 0) {
      const newTapped = tapped - 1
      const newCoins = coins + coinAdd

      try {
        // ✅ Android: Standard vibration API
        if (navigator.vibrate) {
          navigator.vibrate(50) // Vibrate for 50ms
        }

        // ✅ iOS: Try Telegram WebApp Haptic Feedback API
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('medium') // Options: "light", "medium", "heavy"
        }

        // ✅ iOS: Alternative WebKit method (may work in WebView)
        if (window?.webkit?.messageHandlers?.hapticFeedback) {
          window.webkit.messageHandlers.hapticFeedback.postMessage({
            type: 'medium',
          })
        }

        // ✅ iOS: CSS Button Animation (gives a "press" effect)
        const tapButton = document.getElementById('tap-button')
        if (tapButton) {
          tapButton.classList.add('tap-active')
          setTimeout(() => tapButton.classList.remove('tap-active'), 100)
        }

        setTapped(newTapped)
        setCoins(newCoins)

        const userRef = ref(realtimeDB, `users/${userId}`)
        await update(userRef, {
          tapped: newTapped,
          coins: newCoins,
        })
      } catch (error) {
        console.error(
          'Error updating tapped or coins value in Realtime DB:',
          error
        )
      }
    } else {
      console.log('No more taps available!')
    }
  }

  const handleRefill = async () => {
    triggerHapticFeedback
    if (usedRefills < maxRefills && tapped !== taps) {
      const newUsedRefills = usedRefills + 1
      const newTapped = taps

      try {
        setUsedRefills(newUsedRefills)
        setTapped(newTapped)

        const userRef = ref(realtimeDB, `users/${userId}`)
        await update(userRef, {
          usedRefills: newUsedRefills,
          tapped: newTapped,
        })
      } catch (error) {
        console.error('Error refilling in Realtime DB:', error)
      }
    } else {
      if (tapped === taps) {
        console.log('Taps already full, no need to refill!')
      } else {
        console.log('Maximum refills reached!')
      }
    }
  }

  const upgradeRefills = async () => {
    triggerHapticFeedback
    if (maxRefills < 10) {
      const newMaxRefills = maxRefills + 1
      const newCoins = coins - refillCost
      const newRefillCost = Math.floor(refillCost * 1.5)

      if (newCoins >= 0) {
        try {
          setMaxRefills(newMaxRefills)
          setCoins(newCoins)
          setRefillCost(newRefillCost)

          const userRef = ref(realtimeDB, `users/${userId}`)
          await update(userRef, {
            maxRefills: newMaxRefills,
            coins: newCoins,
            refillCost: newRefillCost,
          })
        } catch (error) {
          console.error('Error upgrading refills in Realtime DB:', error)
        }
      } else {
        console.log('Not enough coins to upgrade refills!')
      }
    } else {
      console.log('Maximum refills reached!')
    }
  }

  // Close dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside)

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="taptoearn-container">
      {userData ? (
        <div>
          <p className="taptoearn-coins">
            <img
              src="/assets/crypto-coin.png"
              alt="Crypto Coin"
              className="tte-coin-icon"
            />
            {coins}
          </p>

          <ArcReactor user={user} onClick={handleTap} />

          <div className="tte-tapped-container">
            <p className="taptoearn-tapped">
              {tapped}/{taps}
            </p>
            <button className="tte-boost-button" onClick={toggleDropdown}>
              Boost
            </button>
          </div>

          <div style={{ marginTop: '60px', color: 'rgba(255, 255, 255, 0)' }}>
            .
          </div>

          {showDropdown && (
            <div className="te-boost-menu" ref={dropdownRef}>
              <button
                className="tte-refill-button"
                onClick={handleRefill}
                disabled={usedRefills >= maxRefills}
              >
                {usedRefills >= maxRefills
                  ? 'MAX REFILLS'
                  : `Refills: ${usedRefills} / ${maxRefills}`}
              </button>

              <button
                className="tte-increase-coinadd-button"
                onClick={handleIncreaseCoinAdd}
                disabled={coinAddLevel >= 20 || coins < coinAddCost}
              >
                {coinAddLevel >= 20
                  ? 'MAX'
                  : `Multiplier Level: ${coinAddLevel} Cost: ${coinAddCost}`}
              </button>

              <button
                className="tte-upgrade-refills-button"
                onClick={upgradeRefills}
                disabled={maxRefills >= 10}
              >
                {maxRefills >= 10
                  ? 'MAX LEVEL'
                  : `Refills: ${maxRefills} Cost: ${refillCost}`}
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="taptoearn-loading"></p>
      )}
    </div>
  )
}

export default TapToEarn
