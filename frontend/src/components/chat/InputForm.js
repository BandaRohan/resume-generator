import React, { useEffect } from 'react';
import { FaPaperPlane, FaKeyboard, FaMicrophone } from 'react-icons/fa';
import { motion } from 'framer-motion';

/**
 * InputForm component for sending messages
 * @param {Object} props - Component props
 * @param {string} props.userInput - Current input value
 * @param {Function} props.setUserInput - Function to update input value
 * @param {boolean} props.loading - Whether the application is loading
 * @param {Function} props.sendMessage - Function to send a message
 * @param {Object} props.inputRef - Ref for the input element
 */
const InputForm = ({ userInput, setUserInput, loading, sendMessage, inputRef }) => {
  // Force re-render when loading state changes to ensure animation state is reset
  useEffect(() => {
    // This empty dependency array ensures the effect runs only when loading changes
  }, [loading]);

  return (
    <div className="border-t border-gray-200 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <form
          className="py-4 flex items-center space-x-3"
          onSubmit={sendMessage}
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaKeyboard className="text-gray-400" />
            </div>
            <input
              ref={inputRef}
              type="text"
              className="w-full py-4 pl-12 pr-16 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-gray-700"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your information here..."
              disabled={loading}
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                className="text-gray-400 hover:text-blue-500 transition-colors"
                disabled={loading}
              >
                <FaMicrophone />
              </motion.button>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className={`p-4 rounded-full ${
              userInput.trim() ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300'
            } text-white shadow-md transition-colors duration-200 flex items-center justify-center`}
            disabled={loading || !userInput.trim()}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FaPaperPlane className="w-5 h-5" />
            )}
          </motion.button>
        </form>
        <div className="pb-2 text-center text-xs text-gray-500">
          <p>Powered by GPT-4o-mini • Your data is secure and private</p>
        </div>
      </div>
    </div>
  );
};

export default InputForm;
