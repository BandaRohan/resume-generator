import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ConfirmDialog component for confirming user actions
 * @param {Object} props - Component props
 * @param {boolean} props.showConfirmDialog - Whether to show the dialog
 * @param {Function} props.setShowConfirmDialog - Function to set dialog visibility
 * @param {Function} props.confirmReset - Function to confirm reset action
 */
const ConfirmDialog = ({ showConfirmDialog, setShowConfirmDialog, confirmReset }) => {
  return (
    <AnimatePresence>
      {showConfirmDialog && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowConfirmDialog(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <FaExclamationTriangle className="text-red-500 text-xl" />
              </div>
              <h3 className="text-gray-800 text-lg font-bold">Reset Conversation</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to clear the current conversation? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors font-medium"
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-colors font-medium shadow-sm"
                onClick={confirmReset}
              >
                Reset
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
