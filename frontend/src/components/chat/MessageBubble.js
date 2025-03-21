import React, { useState } from 'react';
import { FaFileAlt, FaUser, FaRobot, FaCopy, FaCheck } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { extractCanvasContent } from '../../utils';
import { motion } from 'framer-motion';

/**
 * MessageBubble component displays a single chat message
 */
const MessageBubble = ({ message, setCanvasContent, setIsCanvasOpen, setCanvasSize }) => {
  const contentParts = extractCanvasContent(message.text);
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Check if message is very short (less than 5 characters)
  const isShortMessage = message.text.trim().length < 5;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-4 rounded-2xl shadow-md my-8 inline-block transition-all duration-200 ${
        message.sender === "user"
          ? "bg-blue-500 text-white ml-auto hover:bg-blue-600"
          : "bg-white border border-gray-200 text-gray-800 mr-auto hover:border-blue-300 hover:shadow-lg"
      } ${message.error ? "bg-red-500 border-red-300" : ""} ${isShortMessage ? "min-w-[100px]" : ""}`}
      style={{ 
        maxWidth: message.sender === "user" ? "70%" : "75%",
        minWidth: "auto"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className={`rounded-full p-2 mr-2 ${message.sender === "user" ? "bg-blue-400" : "bg-gray-200"}`}>
            {message.sender === "user" ? (
              <FaUser className="w-3 h-3 text-white" />
            ) : (
              <FaRobot className="w-3 h-3 text-gray-600" />
            )}
          </div>
          <span className={`text-sm font-medium ${message.sender === "user" ? "text-white" : "text-gray-500"}`}>
            {message.sender === "user" ? "You" : "Resume AI"}
          </span>
        </div>
        
        {message.sender !== "user" && (
          <button
            onClick={() => handleCopyText(message.text)}
            className={`text-gray-400 hover:text-blue-500 transition-colors p-1 rounded-full ml-3 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            title="Copy message"
          >
            {copied ? (
              <FaCheck className="w-4 h-4 text-green-500" />
            ) : (
              <FaCopy className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      
      <div className={`message-content ${message.sender === "user" ? "text-white" : "text-gray-700"}`}>
        {contentParts.map((part, index) =>
          part.type === "code" ? (
            <div key={index} className="mt-4 mb-2">
              <button
                className="inline-flex items-center bg-white text-blue-600 px-4 py-2 rounded-full hover:bg-blue-50 transition-all font-medium shadow-sm border border-blue-100"
                onClick={() => {
                  setCanvasContent(part.text);
                  setIsCanvasOpen(true);
                  setCanvasSize("normal");
                }}
              >
                <FaFileAlt className="mr-2" /> View Generated Resume
              </button>
            </div>
          ) : (
            <div key={index} className={`prose max-w-none ${message.sender === "user" ? "prose-invert" : ""}`}>
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
