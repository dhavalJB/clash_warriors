import React, { useState, useEffect } from 'react'
import { getDatabase, ref, get } from 'firebase/database'
import './style/premium.css'

const Premium = () => {
  const [selectedCategory, setSelectedCategory] = useState('frostguard') // Default category
  const [cards, setCards] = useState([])

  const categories = ['frostguard', 'stormscaller', 'starviya', 'xalgrith'] // Available categories

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const db = getDatabase()
        const cardsRef = ref(db, `premium/${selectedCategory}/`) // Fetch category

        const snapshot = await get(cardsRef)

        if (snapshot.exists()) {
          const data = snapshot.val() // Get the data object
          const formattedCards = Object.keys(data).map((key) => ({
            id: key, // Store cardId
            ...data[key], // Spread card details (like name, description)
          }))

          setCards(formattedCards)
        } else {
          setCards([])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchCards()
  }, [selectedCategory]) // Refetch when category changes

  return (
    <div className="premium-container">
      <h2>Premium Cards</h2>

      {/* Category Selector */}
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        {categories.map((category) => (
          <option key={category} value={category}>
            {category.toUpperCase()}
          </option>
        ))}
      </select>

      {/* Display Fetched Cards */}
      <div className="cards-grid">
        {cards.length > 0 ? (
          cards.map((card) => (
            <div key={card.id} className="card">
              <img src={card.image} alt={card.name} />
              <h3>{card.name || 'Unknown Card'}</h3>
            </div>
          ))
        ) : (
          <p>No cards available for this category.</p>
        )}
      </div>
    </div>
  )
}

export default Premium
