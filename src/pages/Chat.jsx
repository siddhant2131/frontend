// import React, { useState, useEffect, useRef } from 'react';
// import { Send, Bot, User, Loader2, Trash2, LogOut, AlertCircle, Wifi, WifiOff } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// const Chat = () => {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [userName, setUserName] = useState('');
//   const [connectionStatus, setConnectionStatus] = useState('connected');
//   const messagesEndRef = useRef(null);
//   const inputRef = useRef(null);
//   const navigate = useNavigate();

//   // API Configuration
//   const API_BASE_URL = 'https://llm-chat-app-backend.onrender.com/api';

//   // Check authentication on component mount
//   useEffect(() => {
//     const checkAuth = () => {
//       const token = localStorage.getItem('token');
//       const userData = localStorage.getItem('userData');
      
//       if (!token) {
//         navigate('/login');
//         return;
//       }

//       setIsAuthenticated(true);
      
//       if (userData) {
//         try {
//           const user = JSON.parse(userData);
//           setUserName(user.name || 'User');
//         } catch (error) {
//           console.error('Error parsing user data:', error);
//           setUserName('User');
//         }
//       }
//     };

//     checkAuth();
//   }, [navigate]);

//   // Auto-scroll to bottom when messages change
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Focus input when not loading
//   useEffect(() => {
//     if (!isLoading && inputRef.current) {
//       inputRef.current.focus();
//     }
//   }, [isLoading]);

//   // Check server connection on mount
//   useEffect(() => {
//     if (isAuthenticated) {
//       checkServerConnection();
//     }
//   }, [isAuthenticated]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const checkServerConnection = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/health`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         setConnectionStatus('connected');
//       } else {
//         setConnectionStatus('disconnected');
//       }
//     } catch (error) {
//       console.error('Connection check failed:', error);
//       setConnectionStatus('disconnected');
//     }
//   };

//   const sendMessage = async () => {
//     if (!input.trim() || isLoading) return;

//     // Get token from storage
//     const token = localStorage.getItem('token');
//     if (!token) {
//       navigate('/login');
//       return;
//     }

//     const userMessage = {
//       id: Date.now(),
//       text: input.trim(),
//       sender: 'user',
//       timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//     };

//     setMessages(prev => [...prev, userMessage]);
//     const currentInput = input.trim();
//     setInput('');
//     setIsLoading(true);

//     try {
//       console.log('Sending message to:', `${API_BASE_URL}/chat`);
      
//       const response = await fetch(`${API_BASE_URL}/chat`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({ message: currentInput })
//       });

//       const data = await response.json();
//       console.log('Response received:', data);

//       if (!response.ok) {
//         throw new Error(data.error || `Server error: ${response.status}`);
//       }

//       const aiMessage = {
//         id: Date.now() + 1,
//         text: data.reply || 'No response received from Gemini',
//         sender: 'ai',
//         timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//       };

//       setMessages(prev => [...prev, aiMessage]);
//       setConnectionStatus('connected');

//     } catch (error) {
//       console.error('API Error:', error);
      
//       let errorText = 'Failed to get response';
//       let shouldLogout = false;
      
//       if (error.message.includes('401') || error.message.includes('Not authorized') || error.message.includes('Unauthorized')) {
//         errorText = 'Session expired. Please login again.';
//         shouldLogout = true;
//       } else if (error.message.includes('429')) {
//         errorText = 'Too many requests. Please wait a moment and try again.';
//       } else if (error.message.includes('quota') || error.message.includes('QUOTA_EXCEEDED')) {
//         errorText = 'API quota exceeded. Please try again later.';
//       } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
//         errorText = 'Unable to connect to server. Please check if the server is running.';
//         setConnectionStatus('disconnected');
//       } else if (error.message.includes('Invalid Gemini API key')) {
//         errorText = 'API configuration error. Please contact support.';
//       } else {
//         errorText = error.message || 'Something went wrong. Please try again.';
//       }

//       const errorMessage = {
//         id: Date.now() + 1,
//         text: errorText,
//         sender: 'ai',
//         timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//         isError: true
//       };

//       setMessages(prev => [...prev, errorMessage]);

//       if (shouldLogout) {
//         setTimeout(() => {
//           handleLogout();
//         }, 2000);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   const clearChat = () => {
//     setMessages([]);
//     if (inputRef.current) {
//       inputRef.current.focus();
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('userData');
//     setIsAuthenticated(false);
//     setUserName('');
//     setMessages([]);
//     navigate('/login');
//   };

//   const testConnection = async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/health`);
//       const data = await response.json();
//       console.log('Server health check:', data);
      
//       setConnectionStatus('connected');
      
//       const testMessage = {
//         id: Date.now(),
//         text: `🟢 Server Status: ${data.status}\n📡 Connection: Active\n🕒 Time: ${data.timestamp || new Date().toISOString()}`,
//         sender: 'ai',
//         timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//       };
//       setMessages(prev => [...prev, testMessage]);
//     } catch (error) {
//       console.error('Connection test failed:', error);
//       setConnectionStatus('disconnected');
      
//       const errorMessage = {
//         id: Date.now(),
//         text: `🔴 Server connection failed\n❌ Error: ${error.message}\n💡 Make sure the server is running on port 5432`,
//         sender: 'ai',
//         timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//         isError: true
//       };
//       setMessages(prev => [...prev, errorMessage]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Show loading spinner while checking authentication
//   if (!isAuthenticated) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gray-50">
//         <div className="text-center">
//           <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
//           <p className="text-gray-600">Checking authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gray-50">
//       {/* Header */}
//       <div className="bg-white shadow-sm border-b px-6 py-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
//               <Bot className="w-6 h-6 text-white" />
//             </div>
//             <div>
//               <h1 className="text-xl font-semibold text-gray-800">Gemini Chat</h1>
//               <div className="flex items-center space-x-2 text-sm text-gray-500">
//                 <span>Welcome, {userName}</span>
//                 <span>•</span>
//                 <div className="flex items-center space-x-1">
//                   {connectionStatus === 'connected' ? (
//                     <>
//                       <Wifi className="w-3 h-3 text-green-500" />
//                       <span className="text-green-600">Connected</span>
//                     </>
//                   ) : (
//                     <>
//                       <WifiOff className="w-3 h-3 text-red-500" />
//                       <span className="text-red-600">Disconnected</span>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={testConnection}
//               disabled={isLoading}
//               className="px-3 py-2 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors flex items-center space-x-1 disabled:opacity-50"
//               title="Test server connection"
//             >
//               {isLoading ? (
//                 <Loader2 className="w-4 h-4 animate-spin" />
//               ) : (
//                 <Wifi className="w-4 h-4" />
//               )}
//               <span>Test</span>
//             </button>
            
//             <button
//               onClick={clearChat}
//               className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors flex items-center space-x-1"
//               title="Clear chat history"
//             >
//               <Trash2 className="w-4 h-4" />
//               <span>Clear</span>
//             </button>
            
//             <button
//               onClick={handleLogout}
//               className="px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors flex items-center space-x-1"
//               title="Logout"
//             >
//               <LogOut className="w-4 h-4" />
//               <span>Logout</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Messages Container */}
//       <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-gray-100">
//         {messages.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-full text-center">
//             <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-6">
//               <Bot className="w-10 h-10 text-white" />
//             </div>
//             <h2 className="text-2xl font-semibold text-gray-700 mb-3">Welcome to Gemini Chat</h2>
//             <p className="text-gray-500 mb-6 max-w-md">
//               Start a conversation with Google's Gemini AI. Ask questions, get help with coding, writing, or just have a friendly chat!
//             </p>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 max-w-2xl">
//               <div className="bg-white p-4 rounded-lg shadow-sm">
//                 <div className="font-medium mb-2">💬 Ask Questions</div>
//                 <div>Get answers on any topic</div>
//               </div>
//               <div className="bg-white p-4 rounded-lg shadow-sm">
//                 <div className="font-medium mb-2">💻 Code Help</div>
//                 <div>Debug, explain, or write code</div>
//               </div>
//               <div className="bg-white p-4 rounded-lg shadow-sm">
//                 <div className="font-medium mb-2">✍️ Writing Aid</div>
//                 <div>Essays, emails, or creative content</div>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {messages.map((message) => (
//               <div
//                 key={message.id}
//                 className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
//               >
//                 <div
//                   className={`flex max-w-xs lg:max-w-md xl:max-w-2xl ${
//                     message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
//                   } items-start space-x-3`}
//                 >
//                   {/* Avatar */}
//                   <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
//                     message.sender === 'user' 
//                       ? 'bg-gradient-to-r from-blue-500 to-blue-600 ml-3' 
//                       : `${message.isError ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-gray-400 to-gray-500'} mr-3`
//                   }`}>
//                     {message.sender === 'user' ? (
//                       <User className="w-5 h-5 text-white" />
//                     ) : message.isError ? (
//                       <AlertCircle className="w-5 h-5 text-white" />
//                     ) : (
//                       <Bot className="w-5 h-5 text-white" />
//                     )}
//                   </div>
                  
//                   {/* Message Bubble */}
//                   <div
//                     className={`px-4 py-3 rounded-2xl shadow-sm ${
//                       message.sender === 'user'
//                         ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
//                         : message.isError
//                         ? 'bg-red-50 text-red-800 border border-red-200'
//                         : 'bg-white text-gray-800 border border-gray-200'
//                     }`}
//                   >
//                     <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
//                     <p className={`text-xs mt-2 ${
//                       message.sender === 'user' 
//                         ? 'text-blue-100' 
//                         : message.isError
//                         ? 'text-red-500'
//                         : 'text-gray-500'
//                     }`}>
//                       {message.timestamp}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             ))}
            
//             {/* Loading indicator */}
//             {isLoading && (
//               <div className="flex justify-start">
//                 <div className="flex items-start space-x-3">
//                   <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mr-3">
//                     <Bot className="w-5 h-5 text-white" />
//                   </div>
//                   <div className="bg-white text-gray-800 border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
//                     <div className="flex items-center space-x-3">
//                       <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
//                       <div className="flex space-x-1">
//                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
//                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
//                       </div>
//                       <p className="text-sm">Gemini is thinking...</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>
//         )}
//       </div>

//       {/* Input Area */}
//       <div className="bg-white border-t border-gray-200 px-6 py-4">
//         <div className="flex items-end space-x-4">
//           <div className="flex-1 relative">
//             <textarea
//               ref={inputRef}
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={handleKeyPress}
//               placeholder="Type your message here... Press Enter to send, Shift+Enter for new line"
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
//               rows="1"
//               style={{ 
//                 minHeight: '48px', 
//                 maxHeight: '120px',
//                 scrollbarWidth: 'thin'
//               }}
//               disabled={isLoading}
//             />
//           </div>
//           <button
//             onClick={sendMessage}
//             disabled={!input.trim() || isLoading}
//             className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
//             style={{ minHeight: '48px' }}
//           >
//             {isLoading ? (
//               <Loader2 className="w-5 h-5 animate-spin" />
//             ) : (
//               <Send className="w-5 h-5" />
//             )}
//             <span className="font-medium hidden sm:inline">Send</span>
//           </button>
//         </div>
        
//         <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
//           <div className="flex items-center space-x-4">
//             <span>Powered by Google Gemini 1.5 Flash</span>
//             <div className="flex items-center space-x-1">
//               <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
//               <span>{connectionStatus === 'connected' ? 'Online' : 'Offline'}</span>
//             </div>
//           </div>
//           <div className="text-right">
//             <div>Press <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">Enter</kbd> to send</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Chat;

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Trash2, LogOut, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // API Configuration
  const API_BASE_URL = 'https://llm-chat-app-backend.onrender.com/api';

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('userData');
      
      if (!token) {
        navigate('/login');
        return;
      }

      setIsAuthenticated(true);
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUserName(user.name || 'User');
        } catch (error) {
          console.error('Error parsing user data:', error);
          setUserName('User');
        }
      }
    };

    checkAuth();
  }, [navigate]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when not loading
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  // Check server connection on mount
  useEffect(() => {
    if (isAuthenticated) {
      checkServerConnection();
    }
  }, [isAuthenticated]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkServerConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setConnectionStatus('disconnected');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Get token from storage
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      console.log('Sending message to:', `${API_BASE_URL}/chat`);
      
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: currentInput })
      });

      const data = await response.json();
      console.log('Response received:', data);

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      const aiMessage = {
        id: Date.now() + 1,
        text: data.reply || 'No response received from Gemini',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
      setConnectionStatus('connected');

    } catch (error) {
      console.error('API Error:', error);
      
      let errorText = 'Failed to get response';
      let shouldLogout = false;
      
      if (error.message.includes('401') || error.message.includes('Not authorized') || error.message.includes('Unauthorized')) {
        errorText = 'Session expired. Please login again.';
        shouldLogout = true;
      } else if (error.message.includes('429')) {
        errorText = 'Too many requests. Please wait a moment and try again.';
      } else if (error.message.includes('quota') || error.message.includes('QUOTA_EXCEEDED')) {
        errorText = 'API quota exceeded. Please try again later.';
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorText = 'Unable to connect to server. Please check if the server is running.';
        setConnectionStatus('disconnected');
      } else if (error.message.includes('Invalid Gemini API key')) {
        errorText = 'API configuration error. Please contact support.';
      } else {
        errorText = error.message || 'Something went wrong. Please try again.';
      }

      const errorMessage = {
        id: Date.now() + 1,
        text: errorText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);

      if (shouldLogout) {
        setTimeout(() => {
          handleLogout();
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setUserName('');
    setMessages([]);
    navigate('/login');
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      console.log('Server health check:', data);
      
      setConnectionStatus('connected');
      
      const testMessage = {
        id: Date.now(),
        text: `🟢 Server Status: ${data.status}\n📡 Connection: Active\n🕒 Time: ${data.timestamp || new Date().toISOString()}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, testMessage]);
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('disconnected');
      
      const errorMessage = {
        id: Date.now(),
        text: `🔴 Server connection failed\n❌ Error: ${error.message}\n💡 Make sure the server is running on port 5432`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Gemini Chat</h1>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                <span>Welcome, {userName}</span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  {connectionStatus === 'connected' ? (
                    <>
                      <Wifi className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">Connected</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-red-500" />
                      <span className="text-red-600">Disconnected</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={testConnection}
              disabled={isLoading}
              className="p-2 sm:px-3 sm:py-2 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors flex items-center space-x-1 disabled:opacity-50"
              title="Test server connection"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wifi className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Test</span>
            </button>
            
            <button
              onClick={clearChat}
              className="p-2 sm:px-3 sm:py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors flex items-center space-x-1"
              title="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors flex items-center space-x-1"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-gray-50 to-gray-100">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2 sm:mb-3">Welcome to Gemini Chat</h2>
            <p className="text-gray-500 mb-4 sm:mb-6 max-w-md text-sm sm:text-base">
              Start a conversation with Google's Gemini AI. Ask questions, get help with coding, writing, or just have a friendly chat!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-gray-600 w-full max-w-2xl">
              <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                <div className="font-medium mb-1 sm:mb-2">💬 Ask Questions</div>
                <div className="text-xs sm:text-sm">Get answers on any topic</div>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                <div className="font-medium mb-1 sm:mb-2">💻 Code Help</div>
                <div className="text-xs sm:text-sm">Debug, explain, or write code</div>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                <div className="font-medium mb-1 sm:mb-2">✍️ Writing Aid</div>
                <div className="text-xs sm:text-sm">Essays, emails, or creative content</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex max-w-[85%] sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl ${
                    message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  } items-start space-x-2 sm:space-x-3`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 ml-2 sm:ml-3' 
                      : `${message.isError ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-gray-400 to-gray-500'} mr-2 sm:mr-3`
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    ) : message.isError ? (
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div
                    className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : message.isError
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
                    <p className={`text-xs mt-1 sm:mt-2 ${
                      message.sender === 'user' 
                        ? 'text-blue-100' 
                        : message.isError
                        ? 'text-red-500'
                        : 'text-gray-500'
                    }`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="bg-white text-gray-800 border border-gray-200 px-3 py-2 sm:px-4 sm:py-3 rounded-2xl shadow-sm">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-500" />
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <p className="text-sm">Gemini is thinking...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-end space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message here... Press Enter to send, Shift+Enter for new line"
              className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              rows="1"
              style={{ 
                minHeight: '48px', 
                maxHeight: '120px',
                scrollbarWidth: 'thin'
              }}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">Send</span>
              </>
            )}
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 sm:mt-3 text-xs text-gray-500 space-y-1 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
            <span>Powered by Google Gemini 1.5 Flash</span>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span>{connectionStatus === 'connected' ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="hidden sm:block">Press <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">Enter</kbd> to send</div>
            <div className="sm:hidden text-xs">Press Enter to send</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;