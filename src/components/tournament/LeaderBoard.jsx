import React, { useState, useEffect } from 'react'
import { getDatabase, ref, onValue } from 'firebase/database'
import './style/leaderboard.style.css'

const LeaderBoard = ({ user }) => {
  const [leaderboard, setLeaderboard] = useState([])
  const [userRank, setUserRank] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const db = getDatabase()
    const usersRef = ref(db, 'users')
  
    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = Object.values(snapshot.val())
  
        // Include users with at least a first_name or last_name
        const validUsers = usersData.filter(
          (user) => user.first_name || user.last_name
        )
  
        // Sort first by elo, then by registration timestamp for users with the same elo
        const sortedUsers = [...validUsers].sort((a, b) => {
          if ((b.elo || 0) !== (a.elo || 0)) {
            return (b.elo || 0) - (a.elo || 0) // Sort by Elo
          } else {
            // If Elo is the same, sort by registration_timestamp (older first)
            return new Date(a.registration_timestamp) - new Date(b.registration_timestamp)
          }
        })
  
        const rank = sortedUsers.findIndex((u) => u.userId === user?.userId) + 1
  
        setLeaderboard(sortedUsers.slice(0, 100)) // Only the top 100 users
        setUserRank(rank)
      }
      setLoading(false)
    })
  }, [user?.userId])
  

  const top3 = leaderboard.slice(0, 3)
  const remaining = leaderboard.slice(3)

  return (
    <div className="leaderboard-container">
      {loading ? (
        <p className="leaderboard-loading">Loading...</p>
      ) : (
        <>
          {/* Top 3 Section */}
          <div className="leaderboard-top3">
            {top3.length > 0 && (
              <>
                <div className="top3 top3-2">
                  <div
                    className="top3-avatar"
                    style={{
                      backgroundImage: `url(${top3[1]?.photo_url || 'default.jpg'})`,
                    }}
                  ></div>
                  <p className="top3-name">
                    {top3[1]?.first_name} {top3[1]?.last_name}
                  </p>
                  <span className="top3-rank">2</span>
                </div>
                <div className="top3 top3-1">
                  <div
                    className="top3-avatar"
                    style={{
                      backgroundImage: `url(${top3[0]?.photo_url || 'default.jpg'})`,
                    }}
                  ></div>
                  <p className="top3-name">
                    {top3[0]?.first_name} {top3[0]?.last_name}
                  </p>
                  <span className="top3-rank">1</span>
                </div>
                <div className="top3 top3-3">
                  <div
                    className="top3-avatar"
                    style={{
                      backgroundImage: `url(${top3[2]?.photo_url || 'default.jpg'})`,
                    }}
                  ></div>
                  <p className="top3-name">
                    {top3[2]?.first_name} {top3[2]?.last_name}
                  </p>
                  <span className="top3-rank">3</span>
                </div>
              </>
            )}
          </div>

          {/* Main Leaderboard */}
          <table className="leaderboard-table">
            <thead className="leaderboard-thead">
              <tr className="leaderboard-header-row">
                <th className="leaderboard-th">Rank</th>
                <th className="leaderboard-th">Username</th>
                <th className="leaderboard-th">Points</th>
              </tr>
            </thead>
            <tbody className="leaderboard-tbody">
              {remaining.map((player, index) => (
                <tr
                  key={player.userId}
                  className={`leaderboard-row ${
                    player.userId === user?.userId
                      ? 'leaderboard-highlight'
                      : ''
                  }`}
                >
                  <td className="leaderboard-rank">{index + 4}</td>
                  <td className="leaderboard-username">
                    {player.first_name} {player.last_name}
                  </td>
                  <td className="leaderboard-points">{player.elo || 0}</td>
                </tr>
              ))}

              {/* Fallback row for user if they are not in the displayed list */}
              {userRank > 100 && user && (
                <tr className="leaderboard-row leaderboard-sticky">
                  <td className="leaderboard-rank">{userRank}</td>
                  <td className="leaderboard-username">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="leaderboard-points">{user.elo || 0}</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

export default LeaderBoard
