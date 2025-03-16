import React from 'react';
import { 
  FaCode, 
  FaEye, 
  FaCopy, 
  FaDownload, 
  FaCompressAlt, 
  FaExpandAlt, 
  FaTimes 
} from 'react-icons/fa';
import { getCanvasWidth, convertMarkdownToPDF } from '../../utils';
import { motion } from 'framer-motion';

/**
 * Canvas component displays the generated resume content
 * @param {Object} props - Component props
 * @param {boolean} props.isCanvasOpen - Whether the canvas is open
 * @param {string} props.canvasSize - Size of the canvas (normal, expanded, collapsed)
 * @param {string} props.canvasContent - Content to display in the canvas
 * @param {string} props.viewMode - View mode (markdown or preview)
 * @param {Function} props.setViewMode - Function to set view mode
 * @param {Function} props.toggleCanvasSize - Function to toggle canvas size
 * @param {Function} props.setIsCanvasOpen - Function to toggle canvas visibility
 * @param {Function} props.copyToClipboard - Function to copy content to clipboard
 * @param {boolean} props.copySuccess - Whether copy was successful
 * @param {Function} props.downloadResume - Function to download resume as PDF
 */
const Canvas = ({ 
  isCanvasOpen, 
  canvasSize, 
  canvasContent, 
  viewMode, 
  setViewMode, 
  toggleCanvasSize, 
  setIsCanvasOpen, 
  copyToClipboard, 
  copySuccess, 
  downloadResume 
}) => {
  if (!isCanvasOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
      className="bg-white shadow-xl flex flex-col h-full transition-all duration-300 ease-in-out border-l border-gray-200"
      style={{ width: `${getCanvasWidth(canvasSize)}%` }}
    >
      <div className="flex justify-between items-center border-b p-4 bg-gradient-to-r from-gray-50 to-gray-100">
        <h2 className="text-lg font-bold text-gray-700 flex items-center">
          <span className="bg-blue-100 text-blue-600 p-1.5 rounded-full mr-2">
            <FaDownload className="w-4 h-4" />
          </span>
          Generated Resume
        </h2>
        <div className="flex items-center space-x-2">
          {/* Toggle View Mode Buttons */}
          <div className="flex mr-2 bg-gray-200 rounded-full overflow-hidden shadow-sm">
            <motion.button
              whileHover={{ backgroundColor: viewMode === "markdown" ? "rgba(59, 130, 246, 0.8)" : "rgba(229, 231, 235, 0.8)" }}
              onClick={() => setViewMode("markdown")}
              className={`px-3 py-1.5 flex items-center text-sm ${viewMode === "markdown" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-300"}`}
              title="View Markdown"
            >
              <FaCode className="mr-1" /> Markdown
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: viewMode === "preview" ? "rgba(59, 130, 246, 0.8)" : "rgba(229, 231, 235, 0.8)" }}
              onClick={() => setViewMode("preview")}
              className={`px-3 py-1.5 flex items-center text-sm ${viewMode === "preview" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-300"}`}
              title="Preview Resume"
            >
              <FaEye className="mr-1" /> Preview
            </motion.button>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            {/* Copy Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyToClipboard}
              className={`text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors flex items-center ${copySuccess ? 'bg-green-100 text-green-600' : ''}`}
              title="Copy to clipboard"
            >
              <FaCopy className="mr-1" /> 
              {copySuccess ? 'Copied!' : 'Copy'}
            </motion.button>
            
            {/* Download Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadResume}
              className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors flex items-center"
              title="Download resume as PDF"
            >
              <FaDownload className="mr-1" /> Download
            </motion.button>
            
            {/* Toggle Size Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleCanvasSize}
              className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
              title={canvasSize === "expanded" ? "Reduce size" : "Expand size"}
            >
              {canvasSize === "expanded" ? (
                <FaCompressAlt />
              ) : (
                <FaExpandAlt />
              )}
            </motion.button>
            
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(254, 226, 226, 1)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCanvasOpen(false)}
              className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors"
              title="Close output"
            >
              <FaTimes />
            </motion.button>
          </div>
        </div>
      </div>
      <div className="p-6 overflow-auto flex-grow bg-gray-50">
        {viewMode === "markdown" ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-xl border shadow-sm"
          >
            <pre className="whitespace-pre-wrap h-full font-mono text-sm">{canvasContent}</pre>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl border shadow-sm h-full overflow-auto"
          >
            <iframe
              srcDoc={convertMarkdownToPDF(canvasContent)}
              title="Resume Preview"
              className="w-full h-full border-0"
              style={{ minHeight: '80vh' }}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Canvas;
