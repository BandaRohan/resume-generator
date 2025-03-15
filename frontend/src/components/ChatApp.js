import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import html2pdf from "html2pdf.js";
import { 
  FaFileAlt, 
  FaTimes, 
  FaExpandAlt, 
  FaCompressAlt, 
  FaPaperPlane, 
  FaRedo, 
  FaCopy, 
  FaDownload, 
  FaCode, 
  FaEye 
} from "react-icons/fa";

// Utility functions at the top level
const getCanvasWidth = (size) => {
  switch (size) {
    case "expanded": return 60;
    case "compact": return 20;
    case "normal":
    default: return 40;
  }
};

const getChatWidth = (canvasSize) => {
  return 100 - getCanvasWidth(canvasSize);
};

const convertMarkdownToHTML = (markdown) => {
  if (!markdown) return '';
  // ... existing markdown conversion logic ...
};

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [canvasContent, setCanvasContent] = useState("");
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [canvasSize, setCanvasSize] = useState("normal"); // "normal", "expanded", "compact"
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [viewMode, setViewMode] = useState("markdown"); // "markdown" or "preview"
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Toggle canvas size
  const toggleCanvasSize = () => {
    if (canvasSize === "normal") {
      setCanvasSize("expanded");
    } else if (canvasSize === "expanded") {
      setCanvasSize("compact");
    } else {
      setCanvasSize("normal");
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-open canvas when a new bot message with code blocks is received
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === "bot") {
      const codeBlockRegex = /```([\s\S]*?)```/g;
      if (codeBlockRegex.test(lastMessage.text)) {
        // Reset regex state (important when using global flag)
        codeBlockRegex.lastIndex = 0;
        
        // Extract the first code block content
        const match = codeBlockRegex.exec(lastMessage.text);
        if (match && match[1]) {
          setCanvasContent(match[1]);
          setIsCanvasOpen(true);
          setCanvasSize("normal"); // Reset to normal size when auto-opening
        }
      }
    }
  }, [messages]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Adjust the height of the chat container when window is resized
      if (chatContainerRef.current) {
        const windowHeight = window.innerHeight;
        const headerHeight = 64; // Header is typically 64px (p-4)
        const inputHeight = 80; // Input area with padding is about 80px
        chatContainerRef.current.style.height = `${windowHeight - headerHeight - inputHeight}px`;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize height
    
    // Focus input field on load
    inputRef.current?.focus();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset copy success message after 2 seconds
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post("http://127.0.0.1:8000/chat/", {
        message: input,
      });

      setMessages((prev) => [...prev, { text: data.response, sender: "bot" }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { text: "Error processing your request.", sender: "bot", error: true },
      ]);
    } finally {
      setLoading(false);
      // Focus back on input after sending
      inputRef.current?.focus();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(canvasContent).then(
      () => {
        setCopySuccess(true);
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };

  const extractCanvasContent = (text) => {
    const regex = /```([\s\S]*?)```/g;
    let match;
    let parts = [];
    let lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      parts.push({ text: text.substring(lastIndex, match.index), type: "normal" });
      parts.push({ text: match[1], type: "code" });
      lastIndex = regex.lastIndex;
    }

    parts.push({ text: text.substring(lastIndex), type: "normal" });
    return parts;
  };

  const resetChat = () => {
    setShowConfirmDialog(true);
  };

  const confirmReset = () => {
    setMessages([]);
    setCanvasContent("");
    setIsCanvasOpen(false);
    setShowConfirmDialog(false);
    inputRef.current?.focus();
  };

  // Convert markdown to HTML for PDF preview
  const convertMarkdownToPDF = (markdownText) => {
    // Process the markdown text in stages for better control
    let html = markdownText;
    
    // Convert headings
    html = html.replace(/^# (.*$)/gm, '<h1 class="resume-name">$1</h1>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="section-heading">$1</h2>');
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    
    // Convert bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert horizontal rules
    html = html.replace(/^---$/gm, '<hr>');
    
    // TABLE CONVERSION
    // First, identify table sections in the markdown
    let tableRegex = /^\|(.*)\|$/gm;
    let tables = html.match(new RegExp(tableRegex.source + '(\\n' + tableRegex.source + ')+', 'gm'));
    
    if (tables) {
      tables.forEach(table => {
        // Split table into rows
        let rows = table.split('\n').filter(row => row.trim().startsWith('|') && row.trim().endsWith('|'));
        
        // Check if the second row is a separator row (contains only |, -, and :)
        let hasHeader = rows.length > 1 && /^\|[-:\s|]+\|$/.test(rows[1]);
        
        let htmlTable = '<table class="resume-table">\n';
        
        // Process each row
        rows.forEach((row, index) => {
          // Skip separator row
          if (hasHeader && index === 1) return;
          
          // Determine if this is a header row
          const isHeader = hasHeader && index === 0;
          
          // Split the row into cells and remove the first and last empty cells
          let cells = row.split('|').slice(1, -1);
          
          htmlTable += isHeader ? '<thead>\n<tr>\n' : (index === (hasHeader ? 2 : 1) ? '<tbody>\n<tr>\n' : '<tr>\n');
          
          // Process each cell
          cells.forEach(cell => {
            htmlTable += isHeader 
              ? `<th>${cell.trim()}</th>\n` 
              : `<td>${cell.trim()}</td>\n`;
          });
          
          htmlTable += isHeader ? '</tr>\n</thead>\n' : '</tr>\n';
          
          // Close tbody after last row
          if (index === rows.length - 1 && !isHeader) {
            htmlTable += '</tbody>\n';
          }
        });
        
        htmlTable += '</table>';
        
        // Replace the markdown table with HTML table
        html = html.replace(table, htmlTable);
      });
    }
    
    // Convert lists (do this after tables to avoid conflicts)
    html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
    
    // Wrap lists in <ul> tags
    html = html.replace(/<li>.*?<\/li>(\n<li>.*?<\/li>)*/gs, match => {
      return '<ul>' + match + '</ul>';
    });
    
    // Convert paragraphs (lines not matching other patterns)
    const lines = html.split('\n');
    let inParagraph = false;
    let result = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip if line is empty or already converted
      if (line.trim() === '' || 
          line.startsWith('<h') || 
          line.startsWith('<ul>') || 
          line.startsWith('<li>') || 
          line.startsWith('<table') || 
          line.startsWith('<hr')) {
        
        // Close paragraph if we were in one
        if (inParagraph) {
          result.push('</p>');
          inParagraph = false;
        }
        
        result.push(line);
      } else if (!inParagraph) {
        // Start a new paragraph
        result.push('<p>' + line);
        inParagraph = true;
      } else {
        // Continue paragraph with a space
        result.push(line);
      }
    }
    
    // Close final paragraph if needed
    if (inParagraph) {
      result.push('</p>');
    }
    
    html = result.join('\n');
    
    // Create the complete HTML document with styling
    const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume</title>
  <style>
    body {
      font-family: 'Calibri', Arial, sans-serif;
      line-height: 1.5;
      margin: 0 auto;
      padding: 0;
      color: #333;
      background-color: #fff;
    }

    .container {
      padding: 20px;
      max-width: 100%;
    }

    .resume-name {
      font-size: 24pt;
      text-align: center;
      margin-bottom: 5px;
      color: #1a5276;
    }

    .contact-info {
      text-align: center;
      margin-bottom: 15px;
    }

    .section-heading {
      font-size: 14pt;
      color: #1a5276;
      margin-top: 15px;
      margin-bottom: 8px;
      border-bottom: 1px solid #1a5276;
      padding-bottom: 3px;
    }

    hr {
      display: none;
    }

    ul {
      margin-top: 5px;
      padding-left: 20px;
    }

    li {
      margin-bottom: 5px;
    }

    strong {
      font-weight: bold;
    }

    em {
      font-style: italic;
    }
    
    /* Table Styling */
    .resume-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    
    .resume-table th {
      background-color: #f2f2f2;
      font-weight: bold;
      text-align: left;
      padding: 8px;
      border: 1px solid #ddd;
    }
    
    .resume-table td {
      padding: 8px;
      border: 1px solid #ddd;
    }
    
    .resume-table tr:nth-child(even) {
      background-color: #f9f9f9;
    }
  </style>
</head>
<body>
  <div class="container">
    ${html}
  </div>
</body>
</html>
    `;

    return fullHTML;
  };

  // Function to download the resume as PDF - Updated to ensure consistency with preview
  const downloadResume = () => {
    // Create HTML content
    const htmlContent = convertMarkdownToPDF(canvasContent);
    
    // Create a temporary div to hold the HTML content
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    document.body.appendChild(element);
    
    // Configure html2pdf options
    const options = {
      margin: [10, 10, 10, 10], // [top, right, bottom, left] margins in mm
      filename: 'resume.pdf',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        logging: false,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'letter', 
        orientation: 'portrait',
        compress: true
      }
    };
    
    // Generate and download PDF
    html2pdf()
      .from(element)
      .set(options)
      .save()
      .then(() => {
        // Remove the temporary element after PDF generation
        document.body.removeChild(element);
      });
  };

  const MessageBubble = ({ message }) => {
    const contentParts = extractCanvasContent(message.text);
    return (
      <div
        className={`p-4 rounded-lg shadow my-3 transition-all duration-300 max-w-4xl ${
          message.sender === "user"
            ? "bg-blue-500 text-white self-end ml-12"
            : "bg-white border border-gray-200 text-gray-800 self-start mr-12"
        } ${message.error ? "bg-red-100 border-red-300 border" : ""}`}
      >
        {contentParts.map((part, index) =>
          part.type === "code" ? (
            <div key={index} className="mt-3 mb-3">
              <button
                className="inline-flex items-center bg-blue-100 text-blue-600 px-4 py-2 rounded hover:bg-blue-200 transition-all font-medium"
                onClick={() => {
                  setCanvasContent(part.text);
                  setIsCanvasOpen(true);
                  setCanvasSize("normal");
                }}
              >
                <FaFileAlt className="mr-2" /> View Generated Content
              </button>
            </div>
          ) : (
            <div key={index} className="prose max-w-none dark:prose-invert">
              <ReactMarkdown>{part.text}</ReactMarkdown>
            </div>
          )
        )}
      </div>
    );
  };

  // Canvas component inside ChatApp
  const Canvas = () => {
    if (!isCanvasOpen) return null;
    
    return (
      <div
        className="bg-white shadow-lg flex flex-col h-full transition-all duration-300 ease-in-out border-l border-gray-300"
        style={{ width: `${getCanvasWidth(canvasSize)}%` }}
      >
        <div className="flex justify-between items-center border-b p-3 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-700">Generated Resume</h2>
          <div className="flex items-center space-x-2">
            {/* Toggle View Mode Buttons */}
            <div className="flex mr-2 bg-gray-200 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode("markdown")}
                className={`px-3 py-1 flex items-center text-sm ${viewMode === "markdown" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-300"}`}
                title="View Markdown"
              >
                <FaCode className="mr-1" /> Markdown
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`px-3 py-1 flex items-center text-sm ${viewMode === "preview" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-300"}`}
                title="Preview Resume"
              >
                <FaEye className="mr-1" /> Preview
              </button>
            </div>
            
            {/* Copy Button */}
            <button
              onClick={copyToClipboard}
              className={`text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-gray-200 transition-colors flex items-center ${copySuccess ? 'bg-green-100' : ''}`}
              title="Copy to clipboard"
            >
              <FaCopy className="mr-1" /> 
              {copySuccess ? 'Copied!' : 'Copy'}
            </button>
            
            {/* Download Button */}
            <button
              onClick={downloadResume}
              className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-gray-200 transition-colors flex items-center"
              title="Download resume as PDF"
            >
              <FaDownload className="mr-1" /> Download
            </button>
            
            {/* Toggle Size Button */}
            <button
              onClick={toggleCanvasSize}
              className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-gray-200 transition-colors"
              title={canvasSize === "expanded" ? "Reduce size" : "Expand size"}
            >
              {canvasSize === "expanded" ? (
                <FaCompressAlt />
              ) : (
                <FaExpandAlt />
              )}
            </button>
            
            {/* Close Button */}
            <button
              onClick={() => setIsCanvasOpen(false)}
              className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-gray-200 transition-colors"
              title="Close output"
            >
              <FaTimes />
            </button>
          </div>
        </div>
        <div className="p-4 overflow-auto flex-grow bg-gray-50">
          {viewMode === "markdown" ? (
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <pre className="whitespace-pre-wrap h-full font-mono text-sm">{canvasContent}</pre>
            </div>
          ) : (
            <div className="bg-white rounded-lg border shadow-sm h-full overflow-auto">
              <iframe
                srcDoc={convertMarkdownToPDF(canvasContent)}
                title="Resume Preview"
                className="w-full h-full border-0"
                style={{ minHeight: '80vh' }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Custom Confirmation Dialog Component
  const ConfirmDialog = () => {
    if (!showConfirmDialog) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-700 rounded-md shadow-lg p-6 max-w-sm w-full mx-4">
          <h3 className="text-white text-lg font-medium mb-4">localhost:3000 says</h3>
          <p className="text-white mb-6">Are you sure you want to clear the current conversation?</p>
          <div className="flex justify-end space-x-3">
            <button 
              className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500 transition-colors"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              onClick={confirmReset}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Custom Confirmation Dialog */}
      <ConfirmDialog />
      
      {/* Chat Section */}
      <div
        className="flex flex-col h-full transition-all duration-300 ease-in-out"
        style={{ width: `${isCanvasOpen ? getChatWidth(canvasSize) : 100}%` }}
      >
        <header className="bg-blue-600 text-white font-semibold p-4 shadow-md z-10 flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
            </svg>
            <h1 className="text-xl">Resume Generator</h1>
          </div>
          <div className="flex items-center">
            <span className="bg-blue-700 text-xs font-medium px-2.5 py-1 rounded mr-3">
              AI Powered
            </span>
            {!isCanvasOpen && canvasContent && (
              <button 
                onClick={() => setIsCanvasOpen(true)} 
                className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded transition-colors"
              >
                Open Canvases
              </button>
            )}
            <button 
              onClick={resetChat}
              className="ml-3 text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded transition-colors flex items-center"
              title="Start new conversation"
            >
              <FaRedo className="mr-1" /> New
            </button>
          </div>
        </header>

        <main 
          ref={chatContainerRef}
          className="flex-1 p-4 overflow-y-auto flex flex-col space-y-2 bg-gray-50"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500 max-w-md p-8 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-3 text-gray-700">Welcome to Resume Generator</h2>
                <p className="mb-4">Share your information to create a professional resume, or upload an existing resume to improve it.</p>
                <p className="text-sm text-gray-400">Type in the box below to get started...</p>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))
          )}
          <div ref={messagesEndRef} />
        </main>

        <form
          className="p-4 bg-white flex items-center space-x-2 border-t"
          onSubmit={sendMessage}
        >
          <input
            ref={inputRef}
            type="text"
            className="flex-1 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your information here..."
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="flex items-center">
                <span className="mr-1">Send</span> <FaPaperPlane />
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Canvas Section (Appears Only When Opened) */}
      <Canvas />
    </div>
  );
}