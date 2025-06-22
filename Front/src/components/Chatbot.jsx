import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Typing Animation Component
function TypingAnimation({ text, onComplete }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 30); // Speed of typing (30ms per character)

      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return (
    <div className="bg-gray-700 text-white px-4 py-2 rounded-lg">
      <p className="text-sm">
        {displayedText}
        <span className="animate-pulse">|</span>
      </p>
    </div>
  );
}

function Chatbot() {
  const [input, setInput] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in on component mount (optional)
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const email = localStorage.getItem('userEmail') || '';
    setLoggedIn(isLoggedIn);
    setUserEmail(email);
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogin = () => navigate('/login');
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    setLoggedIn(false);
    setUserEmail('');
  };
  const handleSignUp = () => navigate('/signup');

  // Get user's first name from email for greeting, or use "Guest" if not logged in
  const getUserName = () => {
    if (loggedIn && userEmail) {
      const name = userEmail.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return 'Guest';
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Show typing animation placeholder
    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + 1,
        text: '',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isTyping: true
      }
    ]);
    setIsTyping(true);

    // If not found, proceed to backend
    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage.text })
      });
      const data = await response.json();
      const aiText = data.answer || data.response || JSON.stringify(data);

      // Remove the placeholder and add the real AI message with typing animation
      setMessages(prev => [
        ...prev.filter(msg => !msg.isTyping),
        {
          id: Date.now() + 2,
          text: aiText,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isTyping: true
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev.filter(msg => !msg.isTyping),
        {
          id: Date.now() + 2,
          text: 'Sorry, there was an error connecting to RecipeAI backend.',
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isTyping: true
        }
      ]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleTypingComplete = () => {
    setIsTyping(false);
    setMessages(prev => 
      prev.map(msg => 
        msg.isTyping ? { ...msg, isTyping: false } : msg
      )
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePromptClick = (prompt) => {
    setInput(prompt);
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Chat History Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex items-center space-x-2">
          <img src="/thinkai-logo.svg" alt="RecipeAI Logo" className="h-8 w-8" />
          <h2 className="text-xl font-bold text-gray-200">RecipeAI</h2>
        </div>
        <div className="p-4">
          <button 
            onClick={() => setMessages([])}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center justify-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>New Chat</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Placeholder Chat Items */}
          <div className="text-gray-300 hover:text-white cursor-pointer p-2 rounded-md hover:bg-gray-800">
            Today's Recipe Ideas
          </div>
          <div className="text-gray-300 hover:text-white cursor-pointer p-2 rounded-md hover:bg-gray-800">
            Meal Planning Help
          </div>
          <div className="text-gray-300 hover:text-white cursor-pointer p-2 rounded-md hover:bg-gray-800">
            Cooking Tips
          </div>
          <div className="text-gray-300 hover:text-white cursor-pointer p-2 rounded-md hover:bg-gray-800">
            Ingredient Substitutions
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="p-4 flex justify-end items-center w-full border-b border-gray-700">
          <div className="flex items-center space-x-2">
            {/* Removed ThinkAI logo and title from here, now in sidebar */}
          </div>
          {loggedIn ? (
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-lg font-medium">
                {getUserName().charAt(0)}
              </div>
              <button
                onClick={handleLogout}
                className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-300"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex space-x-4">
              <button
                onClick={handleLogin}
                className="bg-green-500 text-black py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300"
              >
                Login
              </button>
              <button
                onClick={handleSignUp}
                className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-300"
              >
                Sign up
              </button>
            </div>
          )}
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            // Welcome screen when no messages
            <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
              {/* Green Glowing Circle */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full blur-xl opacity-60 animate-pulse"></div>
                <div className="w-20 h-20 rounded-full bg-green-500 relative z-10"></div>
              </div>

              <h2 className="text-4xl font-bold text-white">Good evening, {getUserName()}</h2>
              <h3 className="text-3xl font-semibold text-white">Can I help you with anything?</h3>

              {/* Login reminder for guests */}
              {!loggedIn && (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 max-w-md">
                  <p className="text-gray-300 text-sm">
                    💡 <strong>Tip:</strong> Create an account to save your chat history and get personalized recommendations!
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Chat messages
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.isTyping ? (
                    <TypingAnimation 
                      text={message.text} 
                      onComplete={handleTypingComplete}
                    />
                  ) : (
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 text-white px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-end space-x-4">
            <div className="flex-1 bg-gray-800 rounded-lg p-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="How can RecipeAI help you cook today?"
                className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none min-h-[20px] max-h-32"
                rows="1"
              />
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <span>RecipeAI 3.5 Smart</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button className="text-gray-400 hover:text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13.5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-green-500 text-black p-3 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <p className="text-gray-500 text-xs mt-2">RecipeAI can make mistakes. Please double-check responses.</p>
        </div>
      </div>
    </div>
  );
}

export default Chatbot; 