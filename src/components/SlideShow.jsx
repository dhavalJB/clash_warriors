import React, { useState } from 'react'
import './style/collection.css'

const SlideShow = ({ collections, totalSteps, onCardClick }) => {
  const [currentStep, setCurrentStep] = useState(1)
  console.log('Collections received by SlideShow:', collections)

  const handleNext = () => {
    setCurrentStep((prevStep) => (prevStep % totalSteps) + 1) // Loop to the first collection after the last one
  }

  const handlePrevious = () => {
    setCurrentStep((prevStep) =>
      prevStep - 1 <= 0 ? totalSteps : prevStep - 1
    ) // Loop to the last collection from the first one
  }

  const handleTouchStart = (event) => {
    event.target.dataset.touchStartX = event.changedTouches[0].clientX
  }

  const handleTouchEnd = (event) => {
    const touchStartX = parseFloat(event.target.dataset.touchStartX)
    const touchEndX = event.changedTouches[0].clientX
    const deltaX = touchStartX - touchEndX

    if (deltaX > 50) {
      handleNext() // Swipe right -> go to next collection
    } else if (deltaX < -50) {
      handlePrevious() // Swipe left -> go to previous collection
    }
  }

  const cardClass = (collectionIndex) => {
    if (collectionIndex === currentStep - 1)
      return 'collections-nftcard collections-nftprincipal'
    if (
      collectionIndex === currentStep - 2 ||
      (currentStep === 1 && collectionIndex === totalSteps - 1)
    )
      return 'collections-nftcard collections-nftanterior'
    if (collectionIndex === currentStep)
      return 'collections-nftcard collections-nftsiguiente'
    return 'collections-nftcard collections-nftocultar'
  }

  return (
    <div className="collections-nftcontenedor">
      {[...Array(totalSteps)].map((_, index) => {
        const collection = collections[index]
        return (
          <div
            key={collection.id || index} // Ensure unique key for each card
            className={cardClass(index)}
            id={`collections-nftcard-${index}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={() => onCardClick(collection)} // Trigger the onCardClick handler
          >
            <div className="collections-nftcard-image">
              <img src={collection.image} alt={collection.name} />
            </div>
          </div>
        )
      })}
      <div id="div-transparent-previous" onClick={handlePrevious}></div>
      <div id="div-transparent-next" onClick={handleNext}></div>
    </div>
  )
}

export default SlideShow
