import React from 'react';
import { FaRedo, FaFileAlt, FaGraduationCap } from 'react-icons/fa';

/**
 * Header component for the chat application
 * @param {Object} props - Component props
 * @param {boolean} props.isCanvasOpen - Whether the canvas is open
 * @param {string} props.canvasContent - Content in the canvas
 * @param {Function} props.setIsCanvasOpen - Function to set canvas visibility
 * @param {Function} props.resetChat - Function to reset the chat
 */
const Header = ({ isCanvasOpen, canvasContent, setIsCanvasOpen, resetChat }) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold p-4 shadow-lg z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-white p-2 rounded-full mr-3">
            <FaGraduationCap className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold">Resume Generator</h1>
        </div>
        <div className="flex items-center space-x-3">
          <span className="bg-blue-500/40 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-400/30">
            AI Powered
          </span>
          {!isCanvasOpen && canvasContent && (
            <button 
              onClick={() => setIsCanvasOpen(true)} 
              className="text-sm bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-full transition-all duration-300 flex items-center font-medium shadow-sm"
            >
              <FaFileAlt className="mr-2" />
              View Resume
            </button>
          )}
          <button 
            onClick={resetChat}
            className="text-sm bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-full transition-all duration-300 flex items-center font-medium shadow-sm"
            title="Start new conversation"
          >
            <FaRedo className="mr-2" /> New Resume
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
