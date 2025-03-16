import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { motion, AnimatePresence } from "framer-motion";
import { FaRocket, FaSpinner } from "react-icons/fa";

// Import utility functions from the index file
import { getCanvasWidth, getChatWidth, extractCanvasContent, convertMarkdownToPDF } from "../utils";

// Import components
import MessageBubble from "./chat/MessageBubble";
import Canvas from "./chat/Canvas";
import ConfirmDialog from "./chat/ConfirmDialog";
import Header from "./chat/Header";
import InputForm from "./chat/InputForm";
import Sidebar from "./chat/Sidebar";

/**
 * Main ChatApp component that orchestrates the entire application
 */
export default function ChatApp() {
  // State variables
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [canvasContent, setCanvasContent] = useState("");
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [canvasSize, setCanvasSize] = useState("normal");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [viewMode, setViewMode] = useState("markdown"); 
  
  // Conversation management
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Closed by default
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Refs
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Check if screen is mobile size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch all conversations from the API
  const fetchConversations = async () => {
    try {
      setIsInitialLoad(true);
      const response = await axios.get("http://127.0.0.1:8000/conversations/");
      setConversations(response.data);
      
      // If there are conversations, set the first one as active
      if (response.data.length > 0 && !activeConversationId) {
        setActiveConversationId(response.data[0]._id);
        await loadConversation(response.data[0]._id);
      } else if (response.data.length === 0) {
        // If no conversations, create a new one
        createNewConversation();
      }
      setIsInitialLoad(false);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setIsInitialLoad(false);
    }
  };

  // Create a new conversation
  const createNewConversation = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/conversations/", {
        title: "New Conversation"
      });
      
      const newConversation = {
        _id: response.data.id,
        title: response.data.title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setConversations([newConversation, ...conversations]);
      setActiveConversationId(newConversation._id);
      setMessages([]);
      
      // Close sidebar on mobile after creating a new conversation
      if (isMobile) {
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  // Load a conversation by ID
  const loadConversation = async (conversationId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:8000/conversations/${conversationId}/messages`);
      setMessages(response.data.map(msg => ({
        text: msg.text,
        sender: msg.sender,
        error: false
      })));
      setActiveConversationId(conversationId);
      
      // Close sidebar on mobile after selecting a conversation
      if (isMobile) {
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeConversationId]);

  // Toggle canvas size
  const toggleCanvasSize = () => {
    setCanvasSize(prevSize => {
      switch (prevSize) {
        case "normal": return "expanded";
        case "expanded": return "normal";
        case "collapsed": return "normal";
        default: return "normal";
      }
    });
  };

  // Reset copy success state after 2 seconds
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  // Send message to backend
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    
    // Set loading state to true before sending request
    setLoading(true);

    try {
      const { data } = await axios.post("http://127.0.0.1:8000/chat/", {
        message: input,
        conversation_id: activeConversationId
      });

      // Add bot response to messages
      setMessages((prev) => [...prev, { text: data.response, sender: "bot" }]);
      
      // Update conversation ID if a new one was created
      if (data.conversation_id !== activeConversationId) {
        setActiveConversationId(data.conversation_id);
        
        // Refresh conversations list to include the new one
        fetchConversations();
      }
    } catch (error) {
      console.error("Error processing request:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Error processing your request. Please try again.", sender: "bot", error: true },
      ]);
    } finally {
      // Always reset loading state to false when done
      setLoading(false);
      
      // Focus back on input after sending
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Copy canvas content to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(canvasContent).then(
      () => {
        setCopySuccess(true);
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  // Reset chat
  const resetChat = () => {
    setShowConfirmDialog(true);
  };

  // Confirm reset
  const confirmReset = () => {
    createNewConversation();
    setCanvasContent("");
    setIsCanvasOpen(false);
    setShowConfirmDialog(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Download resume as PDF
  const downloadResume = () => {
    // Create HTML content
    const htmlContent = convertMarkdownToPDF(canvasContent);
    
    // Create a temporary container
    const element = document.createElement("div");
    element.innerHTML = htmlContent;
    document.body.appendChild(element);
    
    // Configure html2pdf options
    const opt = {
      margin: [10, 10],
      filename: "resume.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };
    
    // Generate PDF
    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        // Clean up
        document.body.removeChild(element);
      })
      .catch(error => {
        console.error("Error generating PDF:", error);
        document.body.removeChild(element);
      });
  };

  // Loading screen
  if (isInitialLoad) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-r from-blue-500 to-blue-700">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-2xl shadow-2xl text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-4 text-blue-500"
          >
            <FaSpinner className="w-12 h-12" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Resume Generator</h2>
          <p className="text-gray-600">Preparing your AI-powered resume experience...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Custom Confirmation Dialog */}
      <ConfirmDialog 
        showConfirmDialog={showConfirmDialog} 
        setShowConfirmDialog={setShowConfirmDialog} 
        confirmReset={confirmReset} 
      />
      
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        setConversations={setConversations}
        activeConversationId={activeConversationId}
        setActiveConversationId={setActiveConversationId}
        loadConversation={loadConversation}
        createNewConversation={createNewConversation}
        isMobile={isMobile}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      
      {/* Chat Section */}
      <motion.div
        layout
        className="flex flex-col transition-all duration-300 ease-in-out flex-1"
        style={{ 
          width: isMobile ? '100%' : `${isCanvasOpen ? getChatWidth(canvasSize) : 100}%`,
          marginLeft: isMobile ? 0 : (isSidebarOpen ? '20rem' : 0)
        }}
      >
        <Header 
          isCanvasOpen={isCanvasOpen} 
          canvasContent={canvasContent} 
          setIsCanvasOpen={setIsCanvasOpen} 
          resetChat={resetChat}
          toggleSidebar={toggleSidebar}
        />

        <main 
          ref={chatContainerRef}
          className="flex-1 p-4 overflow-y-auto flex flex-col bg-gradient-to-b from-gray-50 to-white"
        >
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col items-center justify-center text-gray-500"
            >
              <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full text-center space-y-4">
                <motion.div 
                  className="bg-blue-100 text-blue-600 p-3 rounded-full inline-flex mx-auto"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaRocket className="w-8 h-8" />
                </motion.div>
                <h2 className="text-xl font-bold text-gray-700">Welcome to Resume Generator</h2>
                <p className="text-gray-600">
                  Start by providing your information for the resume generator. I'll guide you through the process step by step.
                </p>
                <p className="text-sm text-gray-500 pt-2">
                  Powered by AI to create professional, ATS-friendly resumes
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setInput("Hi, I need help creating a professional resume for a software developer position.");
                    inputRef.current?.focus();
                  }}
                  className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
                >
                  Get Started
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence>
              {messages.map((msg, i) => (
                <MessageBubble 
                  key={i} 
                  message={msg} 
                  setCanvasContent={setCanvasContent}
                  setIsCanvasOpen={setIsCanvasOpen}
                  setCanvasSize={setCanvasSize}
                />
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </main>

        <InputForm 
          input={input} 
          setInput={setInput} 
          loading={loading} 
          sendMessage={sendMessage} 
          inputRef={inputRef} 
        />
      </motion.div>

      {/* Canvas Section (Appears Only When Opened) */}
      <AnimatePresence>
        {isCanvasOpen && (
          <Canvas 
            isCanvasOpen={isCanvasOpen}
            canvasSize={canvasSize}
            canvasContent={canvasContent}
            viewMode={viewMode}
            setViewMode={setViewMode}
            toggleCanvasSize={toggleCanvasSize}
            setIsCanvasOpen={setIsCanvasOpen}
            copyToClipboard={copyToClipboard}
            copySuccess={copySuccess}
            downloadResume={downloadResume}
          />
        )}
      </AnimatePresence>
    </div>
  );
}