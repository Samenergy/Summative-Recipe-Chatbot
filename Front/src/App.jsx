import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Chatbot from './components/Chatbot'
import Login from './components/Login'
import Signup from './components/Signup'

function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      {/* Navigation */}
      <nav className="bg-black shadow-sm fixed w-full z-50 transition-all duration-300 hover:shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-green-500 transition-colors duration-300 hover:text-green-400">RecipeAI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-green-500 transition-colors duration-300">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-green-500 transition-colors duration-300">How it Works</a>
              <Link to="/login" className="text-gray-300 hover:text-green-500 transition-colors duration-300">Login</Link>
              <Link to="/signup" className="bg-green-500 text-black px-4 py-2 rounded-md hover:bg-green-600 transform hover:scale-105 transition-all duration-300">
                Sign Up
              </Link>
              <Link to="/chat" className="bg-green-500 text-black px-4 py-2 rounded-md hover:bg-green-600 transform hover:scale-105 transition-all duration-300">
                Try Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Image */}
      <div className="relative">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover animate-subtle-zoom"
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Delicious food spread"
          />
          <div className="absolute inset-0 bg-black opacity-70"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl animate-fade-in">
              <span className="block">Your Personal</span>
              <span className="block text-green-400 animate-pulse-slow">Recipe Assistant</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl animate-slide-up">
              Get instant recipe suggestions, cooking tips, and meal planning help from our AI-powered chatbot.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow animate-bounce-slow">
                <Link to="/chat" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-black bg-green-500 hover:bg-green-600 transform hover:scale-105 transition-all duration-300 md:py-4 md:text-lg md:px-10">
                  Start Cooking
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl animate-fade-in">
              Smart Features for Better Cooking
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="pt-6 transform hover:scale-105 transition-all duration-300">
              <div className="flow-root bg-gray-900 rounded-lg px-6 pb-8 hover:shadow-xl transition-all duration-300">
                <div className="-mt-6">
                  <div className="relative h-48 w-full mb-4 overflow-hidden rounded-lg">
                    <img
                      src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80"
                      alt="Healthy salad"
                      className="h-full w-full object-cover rounded-lg transform hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-lg font-medium text-white tracking-tight">Recipe Suggestions</h3>
                  <p className="mt-5 text-base text-gray-400">
                    Get personalized recipe recommendations based on your preferences and available ingredients.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="pt-6 transform hover:scale-105 transition-all duration-300">
              <div className="flow-root bg-gray-900 rounded-lg px-6 pb-8 hover:shadow-xl transition-all duration-300">
                <div className="-mt-6">
                  <div className="relative h-48 w-full mb-4 overflow-hidden rounded-lg">
                    <img
                      src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                      alt="Meal planning"
                      className="h-full w-full object-cover rounded-lg transform hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-lg font-medium text-white tracking-tight">Meal Planning</h3>
                  <p className="mt-5 text-base text-gray-400">
                    Plan your weekly meals with our AI assistant that considers your dietary needs and preferences.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="pt-6 transform hover:scale-105 transition-all duration-300">
              <div className="flow-root bg-gray-900 rounded-lg px-6 pb-8 hover:shadow-xl transition-all duration-300">
                <div className="-mt-6">
                  <div className="relative h-48 w-full mb-4 overflow-hidden rounded-lg">
                    <img
                      src="https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                      alt="Cooking tips"
                      className="h-full w-full object-cover rounded-lg transform hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-lg font-medium text-white tracking-tight">Quick Tips</h3>
                  <p className="mt-5 text-base text-gray-400">
                    Get instant cooking tips, ingredient substitutions, and technique advice from our AI chef.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-black sm:text-4xl animate-fade-in">
            <span className="block">Ready to start cooking?</span>
            <span className="block text-gray-900">Try our AI recipe assistant today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow animate-pulse-slow">
              <Link to="/chat" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-black hover:bg-gray-900 transform hover:scale-105 transition-all duration-300">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes subtle-zoom {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse-slow {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-subtle-zoom {
          animation: subtle-zoom 20s infinite;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 1s ease-out;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App
