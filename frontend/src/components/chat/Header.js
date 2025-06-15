import React, { useState } from 'react';
import { FaRedo, FaFileAlt, FaGraduationCap, FaInfoCircle, FaGithub, FaBars, FaHome, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';

/**
 * Header component for the chat application
 * @param {Object} props - Component props
 * @param {boolean} props.isCanvasOpen - Whether the canvas is open
 * @param {string} props.canvasContent - Content in the canvas
 * @param {Function} props.setIsCanvasOpen - Function to set canvas visibility
 * @param {Function} props.resetChat - Function to reset the chat
 * @param {Function} props.toggleSidebar - Function to toggle sidebar visibility
 * @param {Object} props.currentUser - Current authenticated user
 * @param {Function} props.handleLogout - Function to handle user logout
 */
const Header = ({ isCanvasOpen, canvasContent, setIsCanvasOpen, resetChat, toggleSidebar, currentUser, handleLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold p-4 md:p-4 p-2 shadow-lg z-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <motion.div 
          className="flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            onClick={toggleSidebar}
            className="mr-3 hover:bg-blue-500/50 p-2 rounded-md transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Toggle sidebar"
          >
            <FaBars className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            onClick={() => window.location.href = '/'}
            className="mr-3 hover:bg-blue-500/50 p-2 rounded-md transition-colors hidden md:block"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Go to Home"
          >
            <FaHome className="w-5 h-5" />
          </motion.button>
          
          <motion.div 
            className="bg-white p-2 rounded-full mr-2 shadow-md"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaGraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </motion.div>
          <h1 className="text-sm sm:text-xl font-bold tracking-tight whitespace-nowrap">Resume Generator</h1>
        </motion.div>
        
        <div className="flex items-center space-x-3">
          <motion.span 
            className="bg-blue-500/40 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-400/30 hidden sm:flex items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FaInfoCircle className="mr-1" />
            AI Powered
          </motion.span>
          
          {!isCanvasOpen && canvasContent && (
            <motion.button 
              onClick={() => setIsCanvasOpen(true)} 
              className="text-sm bg-white text-blue-700 hover:bg-blue-50 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-300 flex items-center font-medium shadow-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <FaFileAlt className="sm:mr-2" />
              <span className="hidden sm:inline">View Resume</span>
              <span className="inline sm:hidden ml-1">Resume</span>
            </motion.button>
          )}
          
          <motion.button 
            onClick={resetChat}
            className="text-sm bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-full transition-all duration-300 flex items-center font-medium shadow-sm"
            title="Start new conversation"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaRedo className="sm:mr-2" /> 
            <span className="hidden sm:inline">New Resume</span>
          </motion.button>
          
          <motion.a
            href="https://github.com/BandaRohan/resume-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-200 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaGithub className="w-5 h-5" />
          </motion.a>
          
          {/* User Profile */}
          <div className="relative">
            <motion.button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center bg-blue-700 hover:bg-blue-600 rounded-full p-2 ml-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaUser className="w-4 h-4" />
            </motion.button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                  <p className="font-medium">{currentUser?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                  {currentUser?.isGuest && (
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full mt-1">
                      Guest User
                    </span>
                  )}
                </div>
                <button
                  onClick={() => window.location.href = '/'}
                  className="md:hidden block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FaHome className="mr-2" /> Home
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FaSignOutAlt className="mr-2" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
