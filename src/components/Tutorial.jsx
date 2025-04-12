import React, { useState, useEffect } from 'react'
import './style/tutorial.style.css'
import { getDatabase, ref, update } from 'firebase/database'

function Tutorial({ user, onClose }) {
  const [showFinalStep, setShowFinalStep] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0) // Track current step

  const tutorialSteps = [
    {
      title: 'Welcome to Clash Warriors! 🚀',
      content: `
        Hello, warriors! Welcome to <strong>Clash Warriors</strong>, the first-ever NFT-based card battle game. This isn’t just another game – it's a revolution in the gaming world. Get ready to prove your skills and rise up! ⚔️
        <br/><br/>
        In <strong>Clash Warriors</strong>, every battle you fight, every card you collect, and every rank you earn is part of something bigger. 💥
        <br/><br/>
        Use <strong>WARS tokens</strong> to purchase cards and power up your gameplay. Some cards are exclusive, rare, and valuable <strong>NFTs</strong>, so don't miss out! 🔥
        <br/><br/>
        Airdrop rewards are based on your <strong>rank</strong>, the <strong>number of cards</strong> you own, and how many <strong>battles you’ve won</strong>. But that’s not all! We’ll be adding new ways to earn rewards soon, so keep playing! 🌟
        <br/><br/>
        This isn’t like other games. We’ll announce all the criteria <strong>before</strong> you need to meet them. No surprises! 🎯
      `,
    },
    {
      title: 'No More Fooling Around 🛡️',
      content: `
        We’re launching on <strong>April 1st</strong> (April Fool’s Day), but there are <strong>no tricks here</strong>. We’re done with fraud in the gaming world. At <strong>Clash Warriors</strong>, everything is upfront, everything is earned. 
        This is your chance to prove you're more than just a player – you're a part of the <strong>future of gaming</strong>. 🌍
        <br/><br/>
        The battlefield awaits. Claim your cards, start battling, and show the world what you’re made of! Are you ready to join the revolution? Let's go! 💪
      `,
    },
    {
      title: 'Tap Smarter, Earn More ⚡',
      content: `
        Traditional tap-to-earn games make you tap endlessly for small rewards. But in <strong>Clash Warriors</strong>, we’re changing the game with our <strong>Power Core</strong> system. 
        <br/><br/>
        🔹 You <strong>start with 100 taps</strong>, but instead of mindless tapping, you can <strong>increase your per-tap earnings</strong>.<br/>
        🔹 <strong>Less tapping, more rewards</strong> – no more finger strain!<br/>
        🔹 Upgrade your Power Core, boost your rewards, and make every tap count! ⚡🔥<br/>
        <br/>
        The future of gaming isn’t about working harder – it’s about playing <strong>smarter</strong>. Are you ready to power up?
      `,
    },
    {
      title: 'The Future Awaits... 🚀',
      content: `
        We're just getting started! Here's a sneak peek at what's coming next to <strong>Clash Warriors</strong>:  
        <br/><br/>
        🔹 <strong>More earning systems</strong> – Unlock new ways to earn, grow your collection, and maximize rewards.<br/>
        🔹 <strong>Multiplayer battles</strong> – Face off against friends and players from around the world in epic battles.<br/>
        🔹 <strong>Team play</strong> – Form powerful teams, strategize together, and conquer the battlefield.<br/>
        🔹 And much more...<br/>
        <br/>
        As a single developer, I’m pouring my heart and soul into every update. It takes time, but rest assured, it's coming soon – and it's going to be worth the wait! 💪💥
      `,
    },
    {
      title: 'Share, Play, and Earn More 💖',
      content: `
        At <strong>Clash Warriors</strong>, it’s not just about playing the game – it’s about creating memories, connecting with others, and growing together. 🌍💫
        <br/><br/>
        🔹 <strong>Share your journey</strong> with friends and fellow warriors. The more you play, the more you earn – and the more you grow.<br/>
        🔹 <strong>Play to unlock</strong> new rewards, challenge yourself, and prove you're more than just a player. You're a part of a revolution in gaming.<br/>
        🔹 <strong>Earn more</strong> by sharing your skills and accomplishments. Every victory, every shared moment, every tap brings you closer to greatness.<br/>
        <br/>
        This isn’t just a game. It’s a community, a movement, a revolution. Are you ready to lead? The battlefield is waiting, and the world is yours to conquer. 💪💥
      `,
    },
  ]

  useEffect(() => {
    if (showFinalStep) {
      document.body.classList.add('popup-open')
    } else {
      document.body.classList.remove('popup-open')
    }

    return () => {
      document.body.classList.remove('popup-open')
    }
  }, [showFinalStep])

  const nextStep = () => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      setShowFinalStep(true)
      saveTutorialCompletion() // Save tutorial completion before showing the final step
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    } else {
      setShowFinalStep(false)
    }
  }

  const saveTutorialCompletion = () => {
    // Save to localStorage
    localStorage.setItem('tutorialDone', 'true')

    // Update the user's tutorial status in Firebase Realtime Database
    const db = getDatabase()
    const userRef = ref(db, `users/${user.userId}`)

    // Use `update` to update only the `tutorialDone` field
    update(userRef, {
      tutorialDone: true,
    })
  }

  const finishTutorial = () => {
    saveTutorialCompletion()
    onClose() // Close the tutorial after saving completion
  }

  const { title, content, image } = tutorialSteps[currentStepIndex]

  return (
    <div className="tutorial-container">
      <div className="popup">
        <div className="popup-content">
          {/* Close (X) Button */}
          <button className="close-btn" onClick={onClose}>
            ✖
          </button>

          <h2 className="neon-text">{title}</h2>
          <div className="scroll-content">
            <p dangerouslySetInnerHTML={{ __html: content }}></p>

            {/* Conditionally render image if it exists */}
            {image && (
              <img src={image} className="tutorial-image" alt="tutorial step" />
            )}
          </div>

          <div className="buttons">
            {currentStepIndex > 0 && (
              <button className="back-btn" onClick={prevStep}>
                ← Back
              </button>
            )}
            {currentStepIndex < tutorialSteps.length - 1 ? (
              <button className="next-btn" onClick={nextStep}>
                Next →
              </button>
            ) : (
              <button className="finish-btn" onClick={finishTutorial}>
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tutorial
