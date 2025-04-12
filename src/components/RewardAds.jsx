import React, { useEffect, useState } from 'react'

const RewardedAd = ({ onReward }) => {
  const [adLoaded, setAdLoaded] = useState(false)

  useEffect(() => {
    if (window.show_8935722) {
      setAdLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = '//whephiwums.com/vignette.min.js'
    script.dataset.zone = '8935722'
    script.dataset.sdk = 'show_8935722'

    script.onload = () => setAdLoaded(true)
    script.onerror = () => console.error('Failed to load Monetag ad script')

    document.body.appendChild(script)
  }, [])

  const showAd = async () => {
    if (!window.show_8935722) {
      alert('Ad not ready yet. Please wait.')
      return
    }

    try {
      await window.show_8935722()
      alert('Ad watched! Reward granted.')
      onReward() // Call reward function after ad is watched
    } catch (error) {
      console.error('Ad error:', error)
      alert('Ad failed to load or was skipped.')
    }
  }

  return (
    <button onClick={showAd} disabled={!adLoaded}>
      {adLoaded ? 'Watch Ad for Reward' : 'Loading Ad...'}
    </button>
  )
}

export default RewardedAd
