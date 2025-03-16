import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { motion, AnimatePresence } from "framer-motion";

// Import utility functions from the index file
import { getCanvasWidth, getChatWidth, extractCanvasContent, convertMarkdownToPDF } from "../utils";

// Import components
import MessageBubble from "./chat/MessageBubble";
import Canvas from "./chat/Canvas";
import ConfirmDialog from "./chat/ConfirmDialog";
import Header from "./chat/Header";
import InputForm from "./chat/InputForm";

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
  
  // Refs
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post("http://127.0.0.1:8000/chat/", {
        message: input,
      });

      setMessages((prev) => [...prev, { text: data.response, sender: "bot" }]);
    } catch (error) {
      console.error("Error processing request:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Error processing your request. Please try again.", sender: "bot", error: true },
      ]);
    } finally {
      setLoading(false);
      // Focus back on input after sending
      inputRef.current?.focus();
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
    setMessages([]);
    setCanvasContent("");
    setIsCanvasOpen(false);
    setShowConfirmDialog(false);
    inputRef.current?.focus();
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

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Custom Confirmation Dialog */}
      <ConfirmDialog 
        showConfirmDialog={showConfirmDialog} 
        setShowConfirmDialog={setShowConfirmDialog} 
        confirmReset={confirmReset} 
      />
      
      {/* Chat Section */}
      <motion.div
        layout
        className="flex flex-col transition-all duration-300 ease-in-out"
        style={{ width: `${isCanvasOpen ? getChatWidth(canvasSize) : 100}%` }}
      >
        <Header 
          isCanvasOpen={isCanvasOpen} 
          canvasContent={canvasContent} 
          setIsCanvasOpen={setIsCanvasOpen} 
          resetChat={resetChat} 
        />

        <main 
          ref={chatContainerRef}
          className="flex-1 p-4 overflow-y-auto flex flex-col"
        >
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col items-center justify-center text-gray-500"
            >
              <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full text-center space-y-4">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-full inline-flex mx-auto">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-700">Welcome to Resume Generator</h2>
                <p className="text-gray-600">
                  Start by providing your information for the resume generator. I'll guide you through the process step by step.
                </p>
                <p className="text-sm text-gray-500 pt-2">
                  Powered by AI to create professional, ATS-friendly resumes
                </p>
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