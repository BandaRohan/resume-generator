import React, { useState, useEffect } from 'react';
import { 
  FaCode, 
  FaEye, 
  FaCopy, 
  FaDownload, 
  FaCompressAlt, 
  FaExpandAlt, 
  FaTimes,
  FaCheckCircle,
  FaFileAlt,
  FaPrint
} from 'react-icons/fa';
import { getCanvasWidth, convertMarkdownToPDF } from '../../utils';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Canvas component displays the generated resume content
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
  const [showTooltip, setShowTooltip] = useState(false);
  
  useEffect(() => {
    if (copySuccess) {
      setShowTooltip(true);
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);
  
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
      <div className="flex justify-between items-center border-b p-4 bg-gradient-to-r from-blue-50 to-blue-100">
        <h2 className="text-lg font-bold text-gray-700 flex items-center">
          <span className="bg-blue-100 text-blue-600 p-2 rounded-full mr-2 shadow-sm">
            <FaFileAlt className="w-4 h-4" />
          </span>
          Generated Resume
        </h2>
        <div className="flex items-center space-x-2">
          {/* Toggle View Mode Buttons */}
          <div className="flex mr-2 bg-gray-200 rounded-full overflow-hidden shadow-sm">
            <motion.button
              whileHover={{ backgroundColor: viewMode === "markdown" ? "rgba(59, 130, 246, 0.8)" : "rgba(229, 231, 235, 0.8)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode("markdown")}
              className={`px-3 py-1.5 flex items-center text-sm ${viewMode === "markdown" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-300"}`}
              title="View Markdown"
            >
              <FaCode className="mr-1" /> Markdown
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: viewMode === "preview" ? "rgba(59, 130, 246, 0.8)" : "rgba(229, 231, 235, 0.8)" }}
              whileTap={{ scale: 0.95 }}
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
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyToClipboard}
                className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors flex items-center"
                title="Copy to clipboard"
              >
                <AnimatePresence mode="wait">
                  {copySuccess ? (
                    <motion.div
                      key="success"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center"
                    >
                      <FaCheckCircle className="mr-1 text-green-500" /> 
                      <span className="text-green-500">Copied</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center"
                    >
                      <FaCopy className="mr-1" /> 
                      <span>Copy</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
              
              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-md"
                  >
                    Copied to clipboard!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Download Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadResume}
              className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors flex items-center"
              title="Download resume as PDF"
            >
              <FaDownload className="mr-1" /> 
              <span className="hidden sm:inline">Download</span>
            </motion.button>
            
            {/* Print Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (viewMode === "preview") {
                  const iframe = document.querySelector('iframe');
                  if (iframe) iframe.contentWindow.print();
                } else {
                  setViewMode("preview");
                  setTimeout(() => {
                    const iframe = document.querySelector('iframe');
                    if (iframe) iframe.contentWindow.print();
                  }, 500);
                }
              }}
              className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors sm:flex hidden items-center"
              title="Print resume"
            >
              <FaPrint className="mr-1" /> 
              <span className="hidden sm:inline">Print</span>
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
            <pre className="whitespace-pre-wrap h-full font-mono text-sm text-gray-800">{canvasContent}</pre>
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
