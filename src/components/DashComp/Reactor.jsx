import React, { useState, useEffect } from 'react'
import './style/reactor.style.css'

const ArcReactor = ({ onClick }) => {
  const [rotationSpeed, setRotationSpeed] = useState(3) // Initial slow rotation speed
  const [glowIntensity, setGlowIntensity] = useState(1) // Initial glow intensity
  const [lastClickTime, setLastClickTime] = useState(0)

  const minRotationSpeed = 0.1 // Minimum speed limit (fastest rotation)
  const defaultRotationSpeed = 3 // Default rotation speed
  const speedStep = 0.1 // Amount to adjust speed per step

  const handleReactorClick = () => {
    const currentTime = Date.now()
    const timeSinceLastClick = currentTime - lastClickTime

    // When a click happens, decrease speed and increase glow
    if (timeSinceLastClick < 200) {
      setRotationSpeed((prev) => Math.max(minRotationSpeed, prev - 0.1))
      setGlowIntensity((prev) => Math.min(5, prev + 0.2)) // Limit max glow
    }

    setLastClickTime(currentTime)

    // If `onClick` is passed, call it to trigger external logic
    if (onClick) {
      onClick() // Trigger the passed handleTap function from TapToEarn
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now()
      const timeSinceLastClick = currentTime - lastClickTime

      if (timeSinceLastClick > 3000 && rotationSpeed < defaultRotationSpeed) {
        // Gradually reset speed to default
        setRotationSpeed((prev) =>
          Math.min(defaultRotationSpeed, prev + speedStep)
        )
      }

      if (timeSinceLastClick > 200) {
        // Gradually reduce glow intensity to zero
        setGlowIntensity((prev) => Math.max(0, prev - 0.1))
      }
    }, 100)

    return () => clearInterval(interval)
  }, [lastClickTime, rotationSpeed])

  return (
    <div className="fullpage-wrapper">
      <div className="reactor-container" onClick={handleReactorClick}>
        <div
          className="reactor-container-inner circle abs-center"
          style={{
            boxShadow: `
              0px 0px ${glowIntensity * 20}px ${glowIntensity * 8}px rgba(255, 255, 255, 0.2),
              0px 0px ${glowIntensity * 40}px ${glowIntensity * 16}px rgba(255, 255, 255, 0.1),
              0px 0px ${glowIntensity * 80}px ${glowIntensity * 32}px rgba(255, 255, 255, 0.05)
            `,
          }}
        ></div>
        <div className="tunnel circle abs-center"></div>
        <div className="core-wrapper circle abs-center"></div>
        <div className="core-outer circle abs-center"></div>
        <div className="core-inner circle abs-center"></div>
        <div
          className="coil-container"
          style={{
            animationDuration: `${rotationSpeed}s`,
          }}
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className={`coil coil-${index + 1}`}
              style={{
                transform: `rotate(${index * 45}deg)`,
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ArcReactor
