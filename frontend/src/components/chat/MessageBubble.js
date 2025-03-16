import React from 'react';
import { FaFileAlt, FaUser, FaRobot } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { extractCanvasContent } from '../../utils';
import { motion } from 'framer-motion';

/**
 * MessageBubble component displays a single chat message
 * @param {Object} props - Component props
 * @param {Object} props.message - Message object with text and sender
 * @param {Function} props.setCanvasContent - Function to set canvas content
 * @param {Function} props.setIsCanvasOpen - Function to toggle canvas visibility
 * @param {Function} props.setCanvasSize - Function to set canvas size
 */
const MessageBubble = ({ message, setCanvasContent, setIsCanvasOpen, setCanvasSize }) => {
  const contentParts = extractCanvasContent(message.text);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-5 rounded-2xl shadow-md my-4 transition-all duration-300 max-w-4xl ${
        message.sender === "user"
          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white self-end ml-12"
          : "bg-white border border-gray-200 text-gray-800 self-start mr-12"
      } ${message.error ? "bg-gradient-to-br from-red-400 to-red-500 border-red-300 border" : ""}`}
    >
      <div className="flex items-center mb-2">
        <div className={`rounded-full p-1.5 mr-2 ${message.sender === "user" ? "bg-blue-400" : "bg-gray-200"}`}>
          {message.sender === "user" ? (
            <FaUser className="w-3 h-3 text-white" />
          ) : (
            <FaRobot className="w-3 h-3 text-gray-600" />
          )}
        </div>
        <span className={`text-sm font-medium ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
          {message.sender === "user" ? "You" : "Resume AI"}
        </span>
      </div>
      
      {contentParts.map((part, index) =>
        part.type === "code" ? (
          <div key={index} className="mt-4 mb-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
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
          <div key={index} className="prose max-w-none dark:prose-invert">
            <ReactMarkdown>{part.text}</ReactMarkdown>
          </div>
        )
      )}
    </motion.div>
  );
};

export default MessageBubble;
