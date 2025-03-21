import React, { useState, useEffect, useRef } from 'react';
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const textAreaRef = useRef(null);
  
  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
      className={`bg-white shadow-xl flex flex-col h-full transition-all duration-300 ease-in-out border-l border-gray-200 ${isMobile ? 'fixed inset-0 z-50' : ''}`}
      style={isMobile ? {} : { width: `${getCanvasWidth(canvasSize)}%` }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100">
        <h2 className="text-lg font-bold text-gray-700 flex items-center mb-2 sm:mb-0">
          <span className="bg-blue-100 text-blue-600 p-2 rounded-full mr-2 shadow-sm">
            <FaFileAlt className="w-4 h-4" />
          </span>
          Generated Resume
        </h2>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 w-full sm:w-auto">
          {/* Toggle View Mode Buttons */}
          <div className="flex mr-1 sm:mr-2 bg-gray-200 rounded-full overflow-hidden shadow-sm">
            <button
              onClick={() => setViewMode("markdown")}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 flex items-center text-xs sm:text-sm transition-colors ${viewMode === "markdown" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              title="View Markdown"
            >
              <FaCode className="mr-1" /> {!isMobile && "Markdown"}
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 flex items-center text-xs sm:text-sm transition-colors ${viewMode === "preview" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              title="Preview Resume"
            >
              <FaEye className="mr-1" /> {!isMobile && "Preview"}
            </button>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-1">
            {/* Copy Button */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyToClipboard}
                className="text-blue-600 hover:text-blue-800 p-1.5 sm:p-2 rounded-full hover:bg-blue-50 transition-colors flex items-center"
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
                      <FaCheckCircle className="text-green-500" /> 
                      <span className="text-green-500 hidden sm:inline ml-1">Copied</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center"
                    >
                      <FaCopy /> 
                      <span className="hidden sm:inline ml-1">Copy</span>
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
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap"
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
              className="text-blue-600 hover:text-blue-800 p-1.5 sm:p-2 rounded-full hover:bg-blue-50 transition-colors flex items-center"
              title="Download resume as PDF"
            >
              <FaDownload /> 
              <span className="hidden sm:inline ml-1">Download</span>
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
              className="text-blue-600 hover:text-blue-800 p-1.5 sm:p-2 rounded-full hover:bg-blue-50 transition-colors flex items-center"
              title="Print resume"
            >
              <FaPrint /> 
              <span className="hidden sm:inline ml-1">Print</span>
            </motion.button>
            
            {/* Toggle Size Button - Hide on mobile */}
            {!isMobile && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleCanvasSize}
                className="text-blue-600 hover:text-blue-800 p-1.5 sm:p-2 rounded-full hover:bg-blue-50 transition-colors"
                title={canvasSize === "expanded" ? "Reduce size" : "Expand size"}
              >
                {canvasSize === "expanded" ? (
                  <FaCompressAlt />
                ) : (
                  <FaExpandAlt />
                )}
              </motion.button>
            )}
            
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(254, 226, 226, 1)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCanvasOpen(false)}
              className="text-red-600 hover:text-red-800 p-1.5 sm:p-2 rounded-full hover:bg-red-100 transition-colors"
              title="Close output"
            >
              <FaTimes />
            </motion.button>
          </div>
        </div>
      </div>
      <div className="p-3 sm:p-6 overflow-auto flex-grow bg-gray-50">
        {viewMode === "markdown" ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-3 sm:p-6 rounded-xl border shadow-sm"
          >
            <pre 
              ref={textAreaRef}
              className="whitespace-pre-wrap h-full font-mono text-sm text-gray-800 overflow-x-auto"
            >
              {canvasContent}
            </pre>
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
              style={{ minHeight: isMobile ? '70vh' : '80vh' }}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Canvas;
