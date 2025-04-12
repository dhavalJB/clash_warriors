Clash Warriors
Clash Warriors is an exciting, fast-paced card battle game developed as a Telegram Mini App. Players collect powerful warriors, complete daily missions, and battle AI opponents in 5-round strategic matches. With rarity-based cards, unique abilities, and synergy-driven gameplay, every match challenges the player's strategy and skill.

Features:
Card Collecting: Collect and upgrade powerful warriors with different rarities.

Daily Rewards: Earn rewards through daily missions and logging in.

Strategic Battles: Engage in 5-round AI matches, each testing your strategic choices.

Synergy and Abilities: Each card comes with unique abilities and synergies that affect battle outcomes.

Leaderboards: Track your progress and see how you stack up against other players based on your in-game coins.

Getting Started
To get started, follow these steps:

Clone the repository:

bash
Copy
Edit
git clone https://github.com/dhavalJB/clash-warriors.git
Navigate to your project directory:

bash
Copy
Edit
cd clash-warriors
Install dependencies:

bash
Copy
Edit
npm install
Run the app locally:

bash
Copy
Edit
npm run dev
This will start the development server using Vite.

Open your browser and go to http://localhost:3000 to start the game locally.

Project Structure
The project is built with React and Vite, providing a fast, optimized development experience. Here's an overview of the key parts:

React: The core front-end framework to build the user interface and handle the gameplay.

Vite: A modern, fast build tool and development server for React applications.

ESLint: A set of ESLint rules configured to ensure consistent code quality. You can modify the rules as per your coding style.

@vitejs/plugin-react: Uses Babel for Fast Refresh, providing a smooth hot-reload experience during development.

@vitejs/plugin-react-swc: Alternative plugin using SWC for Fast Refresh, which can be faster and more efficient than Babel.

Expanding the ESLint Configuration
For a more robust development experience, especially in production applications, we recommend using TypeScript and enabling type-aware lint rules. If you want to integrate TypeScript, you can switch to the TypeScript template and configure typescript-eslint.

Deployment
To deploy your game:

Build the project for production:

bash
Copy
Edit
npm run build
The build files will be generated in the dist folder. Deploy these to your preferred hosting provider (e.g., Vercel, Netlify, etc.).

Ensure that your environment variables (like Firebase credentials) are set properly in your hosting platform.

Technologies Used
React: JavaScript library for building user interfaces.

Vite: Build tool that serves the app with fast hot-module reloading.

ESLint: Linter to maintain consistent code quality.

@vitejs/plugin-react: React Fast Refresh plugin (via Babel).

@vitejs/plugin-react-swc: React Fast Refresh plugin (via SWC).

Firebase: For real-time data storage and user authentication.

Telegram Mini App: Integration with Telegram bot to provide the game as a mini app.
