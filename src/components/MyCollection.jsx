import React, { useEffect, useState } from 'react'
import { realtimeDB } from '../firebase'
import { ref, get } from 'firebase/database'
import './style/collector.css'

const MyCollection = ({ user }) => {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [coins, setCoins] = useState(0)
  const userId = user.userId

  // Fetch user cards from the correct path
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const cardsRef = ref(realtimeDB, `users/${userId}/cards`)
        const snapshot = await get(cardsRef)

        if (snapshot.exists()) {
          const fetchedCards = Object.entries(snapshot.val()).map(
            ([id, data]) => ({
              ...data,
              id: id,
            })
          )

          setCards(fetchedCards)
        } else {
          console.log('No cards found for this user.')
        }
      } catch (error) {
        console.error('Error fetching user cards: ', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [userId])

  // Fetch user coins from Realtime Database
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = ref(realtimeDB, `users/${userId}`)
        const snapshot = await get(userRef)
        if (snapshot.exists()) {
          const data = snapshot.val()
          setCoins(data.coins)
        } else {
          console.log('No user found in Realtime Database')
        }
      } catch (error) {
        console.error('Error fetching user data from Realtime DB:', error)
      }
    }

    fetchUserData()
  }, [userId])

  const formatNumber = (num) => {
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`
    if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`
    return num.toString()
  }

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <div className="collector-container">
      <header className="collection-header">
        <div className="collection-header-left">
          Unleash your <br />
          <span className="highlighted-text">Superheroes NFT</span>
        </div>
        <div className="collection-header-right">
          <img
            src="/assets/crypto-coin.avif"
            alt="Crypto Coin"
            className="crypto-icon"
          />
          <span className="total-crypto">{formatNumber(coins)}</span>
        </div>
      </header>

      {cards.length > 0 ? (
        <ul className="collector-container">
          {cards.map((card) => (
            <li key={card.id} className="collector-nft-card">
              <img src={card.photo} alt={card.name} />
            </li>
          ))}
        </ul>
      ) : (
        <p>No cards available</p>
      )}
    </div>
  )
}

export default MyCollection
