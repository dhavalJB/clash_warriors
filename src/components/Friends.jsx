import React, { useState, useEffect } from 'react'
import { ref, onValue, get } from 'firebase/database'
import { realtimeDB } from '../firebase' // ✅ Import Firebase DB
import './style/Friends.css'
import Header from './DashComp/Header'
import { triggerHapticFeedback } from './tournament/utils/haptic'

const Friends = ({ user }) => {
  console.log('userID', user.userId)

  //const referralLink = `https://t.me/clash_warriors_bot?start=${user.userId}`
  const referralLink = `https://share.clashwarriors.tech/invite/${user.userId}`;

  // ✅ State for storing invited friends' names
  const [invitedFriends, setInvitedFriends] = useState([])
  const totalReferrals = invitedFriends.length

  // ✅ Fetch Friends' User IDs & Then Their Names
  useEffect(() => {
    if (!user?.userId) return // ✅ Ensure user ID is available

    const friendsRef = ref(realtimeDB, `users/${user.userId}/friends`)

    onValue(friendsRef, async (snapshot) => {
      const friendIds = snapshot.val()
      if (!friendIds) {
        setInvitedFriends([])
        return
      }

      // ✅ Fetch names for each userId
      const friendNamesPromises = Object.values(friendIds).map(
        async (friendId) => {
          const userRef = ref(realtimeDB, `users/${friendId}`)
          const userSnapshot = await get(userRef)
          const userData = userSnapshot.val()
          return userData
            ? `${userData.first_name} ${userData.last_name}`
            : 'Unknown User'
        }
      )

      // ✅ Resolve all promises and update state
      const friendNames = await Promise.all(friendNamesPromises)
      setInvitedFriends(friendNames)
    })
  }, [user?.userId]) // ✅ Runs when user ID changes

  // ✅ Copy referral link
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    alert('Referral link copied!')
    triggerHapticFeedback()
  }

  // ✅ Telegram Share Function
  const shareOnTelegram = () => {
    triggerHapticFeedback()
    const message = encodeURIComponent(
      `🔥 Start Clash Wars & Earn Rewards! 🎉\n\nUse my referral link: ${referralLink}`
    )
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${message}`
    window.open(telegramUrl, '_blank')
  }

  return (
    <div className="friends-page">
      <Header user={user} /> {/* ✅ Header stays at the top */}
      {/* ✅ Content Wrapper (Centers Invite Box & Referral List) */}
      <div className="friends-content">
        <div className="invite-box">
          <h2>Refer & Earn</h2>
          <p>
            <strong>Total Referrals:</strong> {totalReferrals}
          </p>

          <div className="invite-section">
            <div className="invite-link">
              <span>{referralLink}</span>
            </div>
            <div className="invite-buttons">
              <button className="copy-button" onClick={copyToClipboard}>
                Copy
              </button>
              <button className="telegram-button" onClick={shareOnTelegram}>
                Share on Telegram
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Dynamic Referral List */}
        <div className="referral-list">
          <h3>Your Referrals</h3>
          {invitedFriends.length > 0 ? (
            invitedFriends.map((friend, index) => (
              <div key={index} className="friend-item">
                {friend}
              </div>
            ))
          ) : (
            <p>No referrals yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Friends
