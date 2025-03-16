import React, { useState } from 'react';
import { FaFileAlt, FaUser, FaRobot, FaCopy, FaCheck } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { extractCanvasContent } from '../../utils';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MessageBubble component displays a single chat message
 */
const MessageBubble = ({ message, setCanvasContent, setIsCanvasOpen, setCanvasSize }) => {
  const contentParts = extractCanvasContent(message.text);
  const [copied, setCopied] = useState(false);
  
  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-5 rounded-2xl shadow-md my-4 transition-all duration-300 max-w-4xl ${
        message.sender === "user"
          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white self-end ml-12 hover:shadow-lg"
          : "bg-white border border-gray-200 text-gray-800 self-start mr-12 hover:border-blue-200 hover:shadow-lg"
      } ${message.error ? "bg-gradient-to-br from-red-400 to-red-500 border-red-300 border" : ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <motion.div 
            className={`rounded-full p-2 mr-2 ${message.sender === "user" ? "bg-blue-400" : "bg-gray-200"}`}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            {message.sender === "user" ? (
              <FaUser className="w-3 h-3 text-white" />
            ) : (
              <FaRobot className="w-3 h-3 text-gray-600" />
            )}
          </motion.div>
          <span className={`text-sm font-medium ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
            {message.sender === "user" ? "You" : "Resume AI"}
          </span>
        </div>
        
        {message.sender !== "user" && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleCopyText(message.text)}
            className={`text-gray-400 hover:text-blue-500 transition-colors p-1 rounded-full`}
            title="Copy message"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaCheck className="w-4 h-4 text-green-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaCopy className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </div>
      
      <div className={`message-content ${message.sender === "user" ? "text-white" : "text-gray-700"}`}>
        {contentParts.map((part, index) =>
          part.type === "code" ? (
            <div key={index} className="mt-4 mb-2">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center bg-white text-blue-600 px-4 py-2 rounded-full hover:bg-blue-50 transition-all font-medium shadow-sm border border-blue-100"
                onClick={() => {
                  setCanvasContent(part.text);
                  setIsCanvasOpen(true);
                  setCanvasSize("normal");
                }}
              >
                <FaFileAlt className="mr-2" /> View Generated Resume
              </motion.button>
            </div>
          ) : (
            <div key={index} className={`prose max-w-none ${message.sender === "user" ? "prose-invert" : "prose-blue"}`}>
              <ReactMarkdown>{part.text}</ReactMarkdown>
            </div>
          )
        )}
      </div>
      
      <div className="text-xs text-right mt-2">
        <span className={`${message.sender === "user" ? "text-blue-200" : "text-gray-400"}`}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
