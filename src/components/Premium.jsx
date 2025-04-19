import React, { useState, useEffect } from 'react'
import {
  getDatabase,
  ref as rtdbRef,
  get,
  set as rtdbSet,
  update,
  child,
} from 'firebase/database'
import AOS from 'aos'
import 'aos/dist/aos.css'
import './style/premium.css'
import {
  TonConnectButton,
  useTonConnectUI,
  useTonWallet,
} from '@tonconnect/ui-react'
import { getFirestore, doc, setDoc } from 'firebase/firestore'
import { db, realtimeDB } from '../firebase' // adjust path if needed
import { Address } from '@ton/core'

const Premium = ({ user }) => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [cards, setCards] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [tonConnectUI] = useTonConnectUI()
  const [previewImage, setPreviewImage] = useState(null)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [justBoughtCardId, setJustBoughtCardId] = useState(null)
  const [isBuying, setIsBuying] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('premiumTut')
    if (!hasSeenTutorial) {
      setShowTutorial(true)
    }
  }, [])

  const categories = [
    'all',
    'frostguard',
    'stormscaller',
    'starviya',
    'xalgrith',
  ]

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      offset: 80,
      easing: 'ease-in-out',
    })
  }, [])

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const db = getDatabase()

        // 1️⃣ Get list of user's owned card IDs
        const userCardsRef = rtdbRef(db, `users/${user.userId}/cards`)
        const userCardsSnap = await get(userCardsRef)
        const ownedCardIds = userCardsSnap.exists()
          ? Object.keys(userCardsSnap.val())
          : []

        const isOwned = (cardId) => ownedCardIds.includes(cardId)

        if (selectedCategory === 'all') {
          const allPromises = categories
            .filter((cat) => cat !== 'all')
            .map(async (cat) => {
              const refPath = rtdbRef(db, `premium/${cat}/`)
              const snap = await get(refPath)
              return snap.exists()
                ? Object.entries(snap.val())
                    .filter(([key]) => !isOwned(key))
                    .map(([key, value]) => ({
                      id: key,
                      ...value,
                    }))
                : []
            })

          const results = await Promise.all(allPromises)
          setCards(results.flat())
        } else {
          const cardsRef = rtdbRef(db, `premium/${selectedCategory}/`)
          const snapshot = await get(cardsRef)

          if (snapshot.exists()) {
            const data = snapshot.val()
            const formattedCards = Object.entries(data)
              .filter(([key]) => !isOwned(key))
              .map(([key, value]) => ({
                id: key,
                ...value,
              }))
            setCards(formattedCards)
          } else {
            setCards([])
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchCards()
  }, [selectedCategory])

  const handleBuy = async () => {
    setIsBuying(true)

    if (!selectedCard || !selectedCard.price) return

    if (!tonConnectUI.account) {
      alert('Wallet not connected. Please connect your wallet.')
      return
    }

    const rawAddress = tonConnectUI.account?.address || ''
    let userFriendlyAddress = ''

    try {
      const addr = Address.parse(rawAddress)
      userFriendlyAddress = addr.toString({ bounceable: true, urlSafe: true })
    } catch (e) {
      console.error('Failed to parse address:', rawAddress, e)
      alert('Invalid wallet address format.')
      return
    }

    const firstChar = userFriendlyAddress.charAt(0)
    if (firstChar === 'k' || firstChar === '0') {
      alert(
        '❌ Testnet wallets are not allowed. Please connect a mainnet wallet.'
      )
      return
    }

    if (selectedCard.sold >= 1000) {
      alert('This card is sold out!')
      return
    }

    const safeCardId = selectedCard?.id || 'unknown_card'
    const safePrice =
      typeof selectedCard?.price === 'number' ? selectedCard.price : 0
    const timestamp = Date.now()

    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 600,
      messages: [
        {
          address: import.meta.env.VITE_WALLET_ADDRESS,
          amount: (safePrice * 1e9).toString(),
        },
      ],
    }

    try {
      const result = await tonConnectUI.sendTransaction(transaction)

      if (!result || !result.boc) {
        alert('❌ Transaction was cancelled or failed. No BOC received.')
        return
      }

      const verifyRes = await fetch(
        'https://cw-backend-571881437561.us-central1.run.app/verify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txHash: result.last?.tx_hash || '',
            expectedAmount: safePrice,
            receiver: import.meta.env.VITE_WALLET_ADDRESS,
            sender: rawAddress,
          }),
        }
      )

      const verifyData = await verifyRes.json()

      if (!verifyRes.ok) {
        alert(
          `❌ Verification error: ${verifyData?.error || 'Unknown error from backend.'}`
        )
        return
      }

      if (!verifyData.verified) {
        alert(
          `❌ Transaction not verified. Reason: ${verifyData?.error || 'Unverified transaction.'}`
        )
        return
      }

      console.log('✅ Backend verified transaction!')

      // Save transaction data
      const transactionDetails = {
        boc: result.boc,
        cardId: safeCardId,
        time: timestamp,
        price: safePrice,
        wallet: rawAddress,
        cardName: selectedCard?.name || '',
        cardImage: selectedCard?.image || '',
        pph: selectedCard?.pph ?? 0,
        xp: selectedCard?.xp ?? 0,
        stats: selectedCard?.stats || {},
        description: selectedCard?.description || '',
      }

      await setDoc(
        doc(db, `users/${user.userId}/cards/${safeCardId}`),
        transactionDetails
      )
      await setDoc(
        doc(db, `cards/${safeCardId}/users/${user.userId}`),
        transactionDetails
      )

      await rtdbSet(
        rtdbRef(realtimeDB, `users/${user.userId}/cards/${safeCardId}`),
        {
          name: selectedCard?.name || '',
          photo: selectedCard?.image || '',
          description: selectedCard?.description || '',
          defaultDeck: 'false',
          stats: selectedCard?.stats || {},
        }
      )

      const statsRef = rtdbRef(realtimeDB, `users/${user.userId}`)
      const statsSnap = await get(statsRef)
      const currentStats = statsSnap.exists() ? statsSnap.val() : {}

      await update(statsRef, {
        totalSpent: (currentStats.totalSpent || 0) + safePrice,
        totalPremium: (currentStats.totalPremium || 0) + 1,
        xp: (currentStats.xp || 0) + (selectedCard?.xp ?? 0),
        pph: (currentStats.pph || 0) + (selectedCard?.pph ?? 0),
      })

      console.log('✅ Full Transaction Saved:', transactionDetails)

      setPurchaseSuccess(true)
      setJustBoughtCardId(safeCardId)
      setCards((prev) => prev.filter((card) => card.id !== safeCardId))
    } catch (error) {
      console.error('❗ Transaction error:', error)
      alert('Transaction failed. Please try again or check your wallet.')
    } finally {
      setSelectedCard(null)
      setIsBuying(false)
      setTimeout(() => {
        setPurchaseSuccess(false)
        setJustBoughtCardId(null)
      }, 4000)
    }
  }

  return (
    <div className="premium-container">
      <div className="premium-header">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '20px',
          }}
        >
          <img
            src="/logo.png"
            alt="Clash Warriors"
            style={{ height: '40px' }}
          />
          <TonConnectButton />
        </div>
      </div>

      <div className="premium-category-tabs">
        {categories.map((category) => (
          <button
            key={category}
            className={`premium-tab-button ${selectedCategory === category ? 'premium-active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="premium-cards-grid">
        {cards.length > 0 ? (
          cards.map((card) => (
            <div
              key={card.id}
              className="premium-card"
              data-aos={Math.random() > 0.5 ? 'fade-up-right' : 'fade-up-left'}
              onClick={() => setSelectedCard(card)}
            >
              <div className="premium-limited-badge">Limited Edition</div>
              <div className="premium-card-count">{card.sold}/1000</div>
              <img src={card.image} alt={card.name} />
              <div className="premium-card-details">
                <h3>{card.name || 'Unknown'}</h3>
                <p>
                  <img src="/assets/walletIcon.png" alt="TON" /> {card.price}{' '}
                  TON
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No cards available for this category.</p>
        )}
      </div>

      {/* Modal for Card Details */}
      {selectedCard && (
        <div
          className="premium-card-modal-overlay"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="premium-card-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="premium-modal-close"
              onClick={() => setSelectedCard(null)}
            >
              ×
            </button>

            <img
              src={selectedCard.image}
              alt={selectedCard.name}
              className="premium-modal-image-full"
              onClick={() => setPreviewImage(selectedCard.image)}
              style={{ cursor: 'zoom-in' }}
            />

            {previewImage && (
              <div
                className="image-preview-overlay"
                onClick={() => setPreviewImage(null)}
              >
                <div
                  className="image-preview-modal"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="image-preview-close"
                    onClick={() => setPreviewImage(null)}
                  >
                    ×
                  </button>
                  <img src={previewImage} alt="Preview" />
                </div>
              </div>
            )}

            <div className="premium-modal-content">
              <h2>{selectedCard.name}</h2>
              <p className="premium-description">{selectedCard.description}</p>

              <div className="premium-modal-section">
                <h3 className="premium-section-heading">Stats</h3>
                <div className="premium-stats-split">
                  <div className="premium-stats-column">
                    <p>🛡️ Armor: {selectedCard.stats?.armor}</p>
                    <p>⚔️ Attack: {selectedCard.stats?.attack}</p>
                    <p>⚡ Agility: {selectedCard.stats?.agility}</p>
                  </div>
                  <div className="premium-stats-column">
                    <p>🧠 Intelligence: {selectedCard.stats?.intelligence}</p>
                    <p>🔥 Powers: {selectedCard.stats?.powers}</p>
                    <p>❤️ Vitality: {selectedCard.stats?.vitality}</p>
                  </div>
                </div>

                <hr className="premium-stats-divider" />

                <div className="premium-xp-pph-wrapper">
                  <div className="premium-xp-pph-row">
                    <p>💥 PPH: {selectedCard.pph}/H</p>
                    <p>
                      <img src="/l32.png" alt="WARS" /> 10,000 WARS
                    </p>
                    <p>✨ XP: {selectedCard.xp || '0'}</p>
                  </div>
                </div>
              </div>

              <button
                className="premium-buy-button"
                onClick={handleBuy}
                disabled={isBuying}
              >
                {isBuying
                  ? 'Processing...'
                  : `Buy for ${selectedCard.price} TON`}
              </button>
            </div>
          </div>
        </div>
      )}

      {purchaseSuccess && (
        <div className="premium-success-modal">
          <div className="premium-success-box" data-aos="zoom-in">
            <h2>Purchase Successful!</h2>
            <p>You now own this card 🎉</p>
          </div>
        </div>
      )}

{showTutorial && (
  <div className="premium-card-modal-overlay" onClick={() => setShowTutorial(false)}>
    <div className="premium-card-modal" onClick={(e) => e.stopPropagation()}>
      <button className="premium-modal-close" onClick={() => setShowTutorial(false)}>
        ×
      </button>
      <div className="premium-modal-content">
        <h2>Welcome to the Premium Zone</h2>
        <p>
          Step into the world of <strong>limited-edition heroes</strong> — once they're gone, they're gone forever.
        </p>
        <ul style={{ textAlign: 'left', marginTop: '1rem' }}>
          <li>💎 Instantly unlock powerful heroes with elite stats</li>
          <li>🎁 <strong>1st Airdrop:</strong> Get <strong>10,000 $WARS</strong> per premium card — no requirements, no conditions</li>
          <li>⚡ Boost your XP and PPH from day one</li>
          <li>🎨 Own stunning, exclusive art — only <strong>1000</strong> of each card will ever exist</li>
        </ul>
        <p style={{ marginTop: '1rem', fontWeight: 'bold', color: '#e63946' }}>
          Don’t miss this limited-time opportunity. Rewards are automatic — you buy, you get. Simple as that.
        </p>
        <button
          className="premium-buy-button"
          onClick={() => {
            setShowTutorial(false)
            localStorage.setItem('premiumTut', 'true')
          }}
          style={{ marginTop: '20px' }}
        >
          Join Airdrop
        </button>
      </div>
    </div>
  </div>
)}



    </div>
  )
}

export default Premium
