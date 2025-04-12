import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './style/defaultDeckModal.style.css'
import { getDatabase, ref, get } from 'firebase/database';

const DefaultDeckModal = ({ isOpen, onClose, user }) => {
  const [defaultDeck, setDefaultDeck] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalSynergy, setTotalSynergy] = useState(0) // ✅ New state for synergy
  const navigate = useNavigate()
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && user?.userId) {
      setLoading(true);
  
      const db = getDatabase();
  
      // Fetch totalSynergy
      const synergyRef = ref(db, `users/${user.userId}/totalSynergy`);
      get(synergyRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            setTotalSynergy(snapshot.val());
          } else {
            setTotalSynergy(0);
          }
        })
        .catch((error) => {
          console.error('❌ Error fetching total synergy:', error);
          setTotalSynergy(0);
        });
  
      // Fetch default deck cards from Firebase
      const cardsRef = ref(db, `users/${user.userId}/cards`);
      get(cardsRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const cardsData = snapshot.val();
            const defaultDeckArray = [];
  
            Object.entries(cardsData).forEach(([cardId, cardInfo]) => {
              if (cardInfo.defaultDeck) {
                defaultDeckArray.push({
                  id: cardId,
                  ...cardInfo,
                });
              }
            });
  
            setDefaultDeck(defaultDeckArray);
          } else {
            console.warn('⚠️ No cards found.');
            setDefaultDeck([]);
          }
        })
        .catch((err) => {
          console.error('❌ Error fetching cards from Firebase:', err);
          setError('Failed to load default deck.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, user?.userId]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose(); // Close when clicked outside
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null

  return (
    <div className="default-deck-modal-overlay" onClick={onClose} ref={modalRef}>
      <div
        className="default-deck-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {loading && <p>Loading deck...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <div className="default-deck-modal-grid">
            {Array.from({ length: 10 }, (_, index) => {
              const card = defaultDeck[index]
              return (
                <div key={index} className="default-deck-modal-card">
                  {card ? (
                    <img
                      src={card.photo}
                      alt={card.name}
                      className="default-deck-modal-card-image"
                    />
                  ) : (
                    <div className="default-deck-modal-placeholder">
                      Add Card
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Footer with Total Synergy in Button */}
        <div className="default-deck-modal-footer">
          <button
            className="go-to-builddeck-button"
            onClick={() => navigate('/builddeck')}
          >
            Build Deck (Synergy: {totalSynergy})
          </button>
        </div>
      </div>
    </div>
  )
}

export default DefaultDeckModal
