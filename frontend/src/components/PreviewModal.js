import React from 'react';
import '../styles/PreviewModal.css';

function PreviewModal({ 
  showPreview, 
  previewContent, 
  position, 
  isDragging, 
  handleMouseDown, 
  onClose 
}) {
  if (!showPreview) return null;

  const modalStyle = {
    transform: position.x === 0 && position.y === 0 
      ? 'translate(-50%, -50%)' 
      : 'none',
    left: position.x === 0 ? '50%' : `${position.x}px`,
    top: position.y === 0 ? '50%' : `${position.y}px`,
    position: 'absolute',
    cursor: isDragging ? 'grabbing' : 'default'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div 
        className="bg-white rounded-lg w-full max-w-4xl h-3/4 flex flex-col shadow-xl transform transition-all duration-300"
        style={{
          ...modalStyle,
          animation: 'modalSlideIn 0.3s ease-out'
        }}
      >
        <div 
          className="modal-header p-4 border-b flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg"
          onMouseDown={handleMouseDown}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <h2 className="text-xl font-semibold select-none flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors duration-200 p-2 rounded-full hover:bg-blue-500"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 p-4 overflow-auto bg-white rounded-b-lg">
          <div 
            dangerouslySetInnerHTML={{ __html: previewContent }}
            className="preview-modal-content"
          />
        </div>
      </div>
    </div>
  );
}

export default PreviewModal; 