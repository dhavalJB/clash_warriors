// utils/adsgram.js

export const showRewardedAd = async (userId) => {
  if (!userId) {
    console.warn('Missing userId for rewarded ad')
    return false
  }

  if (!window?.Adsgram) {
    alert('Adsgram not loaded')
    return false
  }

  try {
    const AdController = window.Adsgram.init({ blockId: '9749' }) // Your actual blockId
    const result = await AdController.show()

    console.log('✅ Ad result:', result)

    if (result.done && !result.error) {
      const res = await fetch(
        `https://cw-backend-571881437561.us-central1.run.app/api/ads/reward?userid=${userId}`
      )
      const data = await res.text()
      console.log('✅ Reward sent:', data)
      alert('🎉 You earned a reward!')
      return true
    } else {
      console.log('❌ Ad skipped or failed')
      return false
    }
  } catch (error) {
    console.error('❌ Ad failed to show:', error)
    alert('Failed to show ad')
    return false
  }
}


// utils/adsgram.js

export async function showAdsgramInterstitial(blockId = 'int-9750') {
  try {
    const result = await window.Adsgram.init({ blockId }).show()
    return result // If you want to know the result
  } catch (error) {
    console.warn('Adsgram banner error:', error)
    return null
  }
}
