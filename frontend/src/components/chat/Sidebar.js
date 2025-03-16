import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaTimes, FaCheck, FaChevronRight } from "react-icons/fa";
import { format } from "date-fns";

/**
 * Sidebar component for managing conversations
 */
const Sidebar = ({
  conversations,
  setConversations,
  activeConversationId,
  setActiveConversationId,
  loadConversation,
  createNewConversation,
  isMobile,
  isSidebarOpen,
  setIsSidebarOpen
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy");
    } catch (error) {
      return "Unknown date";
    }
  };

  // Handle conversation editing
  const startEditing = (id, title) => {
    setEditingId(id);
    setEditTitle(title);
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) return;
    
    try {
      await axios.put(`http://127.0.0.1:8000/conversations/${id}`, {
        title: editTitle
      });
      
      setConversations(conversations.map(conv => 
        conv._id === id ? { ...conv, title: editTitle } : conv
      ));
      
      setEditingId(null);
    } catch (error) {
      console.error("Error updating conversation title:", error);
    }
  };

  // Handle conversation deletion
  const deleteConversation = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/conversations/${id}`);
      
      setConversations(conversations.filter(conv => conv._id !== id));
      
      // If the active conversation was deleted, set a new active conversation
      if (activeConversationId === id) {
        const remainingConversations = conversations.filter(conv => conv._id !== id);
        if (remainingConversations.length > 0) {
          setActiveConversationId(remainingConversations[0]._id);
          loadConversation(remainingConversations[0]._id);
        } else {
          // If no conversations left, create a new one
          createNewConversation();
        }
      }
      
      setConfirmDeleteId(null);
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  // Handle conversation selection
  const selectConversation = (id) => {
    if (id !== activeConversationId) {
      setActiveConversationId(id);
      loadConversation(id);
    }
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.div
          className="fixed inset-y-0 left-0 w-80 bg-gray-900 text-white p-4 shadow-lg z-20 flex flex-col"
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Conversations</h2>
            <motion.button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-md hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Close sidebar"
            >
              <FaTimes className="w-4 h-4" />
            </motion.button>
          </div>
          
          <motion.button
            onClick={createNewConversation}
            className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md mb-4 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaPlus className="mr-2" />
            New Conversation
          </motion.button>
          
          <div className="overflow-y-auto flex-1 -mx-4 px-4">
            {conversations.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                No conversations yet
              </div>
            ) : (
              <ul className="space-y-2">
                {conversations.map((conv) => (
                  <li key={conv._id}>
                    {editingId === conv._id ? (
                      <div className="bg-gray-800 rounded-md p-3">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(conv._id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <div className="flex justify-end space-x-2">
                          <motion.button
                            onClick={() => saveEdit(conv._id)}
                            className="flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaCheck className="mr-1" /> Save
                          </motion.button>
                          <motion.button
                            onClick={() => setEditingId(null)}
                            className="flex items-center bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaTimes className="mr-1" /> Cancel
                          </motion.button>
                        </div>
                      </div>
                    ) : confirmDeleteId === conv._id ? (
                      <div className="bg-red-900/40 rounded-md p-3 border border-red-700">
                        <p className="text-sm mb-3">Delete this conversation?</p>
                        <div className="flex justify-end space-x-2">
                          <motion.button
                            onClick={() => deleteConversation(conv._id)}
                            className="flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaTrash className="mr-1" /> Delete
                          </motion.button>
                          <motion.button
                            onClick={() => setConfirmDeleteId(null)}
                            className="flex items-center bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaTimes className="mr-1" /> Cancel
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <motion.div
                        className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
                          activeConversationId === conv._id
                            ? "bg-blue-700"
                            : "hover:bg-gray-800"
                        }`}
                        onClick={() => selectConversation(conv._id)}
                        onMouseEnter={() => setHoveredId(conv._id)}
                        onMouseLeave={() => setHoveredId(null)}
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          <FaChevronRight className={`w-3 h-3 mr-2 ${
                            activeConversationId === conv._id ? "opacity-100" : "opacity-0"
                          }`} />
                          <div className="truncate">
                            <div className="font-medium truncate">{conv.title}</div>
                            <div className="text-xs text-gray-400 truncate">
                              {formatDate(conv.created_at)}
                            </div>
                          </div>
                        </div>
                        
                        {hoveredId === conv._id && (
                          <div className="flex space-x-2">
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(conv._id, conv.title);
                              }}
                              className="text-gray-400 hover:text-white p-1 bg-gray-800/50 rounded-full"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Edit conversation"
                            >
                              <FaEdit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(conv._id);
                              }}
                              className="text-gray-400 hover:text-red-400 p-1 bg-gray-800/50 rounded-full"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Delete conversation"
                            >
                              <FaTrash className="w-4 h-4" />
                            </motion.button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500 text-center">
            Resume Generator v1.0
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
