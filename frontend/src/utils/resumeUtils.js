/**
 * Utility functions for resume generation and formatting
 * Ensures consistent font rendering across all devices
 */

/**
 * Converts markdown to PDF-ready HTML with consistent font rendering
 * @param {string} markdownText - The markdown text to convert
 * @returns {string} - The HTML string with styling for PDF
 */
export const generateResumeHTML = (markdownText) => {
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
        line.startsWith('<hr>')) {
      
      // Close paragraph if we were in one
      if (inParagraph) {
        result[result.length - 1] += '</p>';
        inParagraph = false;
      }
      
      // Add the line as is
      result.push(line);
    } else if (!inParagraph) {
      // Start a new paragraph
      result.push('<p>' + line);
      inParagraph = true;
    } else {
      // Continue paragraph with a space
      result.push(' ' + line);
    }
  }
  
  // Close final paragraph if needed
  if (inParagraph) {
    result.push('</p>');
  }
  
  html = result.join('\n');
  
  // Return the complete HTML document with styling
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Resume Preview</title>
  <style>
    @font-face {
      font-family: 'ResumeFont';
      src: local('Helvetica Neue'), local('Arial'), local('sans-serif');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    
    @font-face {
      font-family: 'ResumeFont';
      src: local('Helvetica Neue Bold'), local('Arial Bold'), local('sans-serif');
      font-weight: bold;
      font-style: normal;
      font-display: swap;
    }
    
    body {
      font-family: 'ResumeFont', 'Helvetica Neue', Arial, sans-serif !important;
      line-height: 1.6;
      color: #333;
      background-color: #fff;
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }
    
    * {
      font-family: 'ResumeFont', 'Helvetica Neue', Arial, sans-serif !important;
      box-sizing: border-box;
    }
    
    .container {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      box-sizing: border-box;
    }
    
    @media print {
      .container {
        width: 100%;
        max-width: none;
        padding: 0;
        margin: 0;
      }
      
      body {
        background-color: white;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
    
    @media screen and (max-width: 768px) {
      .container {
        padding: 10px;
      }
      
      h1, h2, h3 {
        margin-top: 8px;
        margin-bottom: 8px;
      }
      
      .resume-section {
        margin-bottom: 12px;
      }
      
      .resume-name {
        font-size: 24px;
      }
      
      .section-heading {
        font-size: 18px;
      }
      
      p, li {
        font-size: 14px;
      }
    }
    
    .resume-name {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 5px;
      color: #2563eb;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 5px;
      font-family: 'ResumeFont', 'Helvetica Neue', Arial, sans-serif !important;
    }
    
    .section-heading {
      font-size: 20px;
      font-weight: bold;
      margin-top: 20px;
      margin-bottom: 10px;
      color: #1e40af;
      border-bottom: 1px solid #ddd;
      padding-bottom: 3px;
      font-family: 'ResumeFont', 'Helvetica Neue', Arial, sans-serif !important;
    }
    
    h3 {
      font-size: 16px;
      font-weight: bold;
      margin-top: 15px;
      margin-bottom: 5px;
      color: #333;
      font-family: 'ResumeFont', 'Helvetica Neue', Arial, sans-serif !important;
    }
    
    p {
      margin-top: 5px;
      margin-bottom: 5px;
      font-family: 'ResumeFont', 'Helvetica Neue', Arial, sans-serif !important;
    }
    
    .resume-section {
      margin-bottom: 20px;
    }
    
    hr {
      border: none;
      height: 1px;
      background-color: #ddd;
      margin: 20px 0;
    }
    
    .contact-info {
      margin-bottom: 15px;
      font-size: 14px;
      font-family: 'ResumeFont', 'Helvetica Neue', Arial, sans-serif !important;
    }
    
    .job-title {
      font-weight: bold;
      margin-bottom: 0;
      font-family: 'ResumeFont', 'Helvetica Neue', Arial, sans-serif !important;
    }
    
    .job-date {
      font-style: italic;
      color: #666;
      font-size: 14px;
      margin-top: 0;
      font-family: 'ResumeFont', 'Helvetica Neue', Arial, sans-serif !important;
    }
    
    .job-description {
      margin-top: 5px;
      font-family: 'ResumeFont', 'Helvetica Neue', Arial, sans-serif !important;
    }
    
    ul {
      margin-top: 5px;
      padding-left: 20px;
    }
    
    li {
      margin-bottom: 5px;
      font-family: 'ResumeFont', 'Helvetica Neue', Arial, sans-serif !important;
    }
    
    strong {
      font-weight: bold;
      font-family: 'ResumeFont', 'Helvetica Neue', Arial, sans-serif !important;
    }
    
    em {
      font-style: italic;
      font-family: 'ResumeFont', 'Helvetica Neue', Arial, sans-serif !important;
    }
    
    /* Table Styling */
    .resume-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      overflow-x: auto;
      display: block;
    }
    
    @media screen and (min-width: 768px) {
      .resume-table {
        display: table;
      }
    }
    
    .resume-table th {
      background-color: #f2f2f2;
      font-weight: bold;
      text-align: left;
      padding: 8px;
      border: 1px solid #ddd;
      font-family: 'ResumeFont', 'Helvetica Neue', Arial, sans-serif !important;
    }
    
    .resume-table td {
      padding: 8px;
      border: 1px solid #ddd;
      word-break: break-word;
      font-family: 'ResumeFont', 'Helvetica Neue', Arial, sans-serif !important;
    }
    
    .resume-table tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    
    /* Fix for mobile overflow */
    @media screen and (max-width: 480px) {
      pre, code {
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow-wrap: break-word;
        max-width: 100%;
        font-family: 'ResumeFont', 'Helvetica Neue', monospace !important;
      }
      
      .resume-table th,
      .resume-table td {
        padding: 5px;
        font-size: 13px;
      }
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
};

/**
 * Creates a PDF from resume markdown content
 * @param {string} markdownText - The markdown text to convert to PDF
 * @param {Object} options - PDF generation options
 * @returns {Promise} - Promise that resolves when PDF is generated
 */
export const generateResumePDF = (markdownText, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // Import html2pdf dynamically to avoid SSR issues
      import('html2pdf.js').then(html2pdfModule => {
        const html2pdf = html2pdfModule.default;
        
        // Create HTML content with consistent font styling
        const htmlContent = generateResumeHTML(markdownText);
        
        // Create a temporary container
        const element = document.createElement("div");
        element.innerHTML = htmlContent;
        document.body.appendChild(element);
        
        // Configure html2pdf options
        const opt = {
          margin: [10, 10],
          filename: options.filename || "resume.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { 
            scale: 2, 
            useCORS: true,
            letterRendering: true,
            allowTaint: true
          },
          jsPDF: { 
            unit: "mm", 
            format: "a4", 
            orientation: "portrait",
            compress: true
          }
        };
        
        // Generate PDF
        html2pdf()
          .set(opt)
          .from(element)
          .save()
          .then(() => {
            // Clean up
            document.body.removeChild(element);
            resolve();
          })
          .catch(error => {
            console.error("Error generating PDF:", error);
            document.body.removeChild(element);
            reject(error);
          });
      }).catch(error => {
        console.error("Error loading html2pdf:", error);
        reject(error);
      });
    } catch (error) {
      console.error("Error in generateResumePDF:", error);
      reject(error);
    }
  });
};

/**
 * Previews resume in a new tab with consistent font rendering
 * @param {string} markdownText - The markdown text to preview
 */
export const previewResume = (markdownText) => {
  try {
    // Generate HTML with consistent font styling
    const htmlContent = generateResumeHTML(markdownText);
    
    // Open a new window and write the HTML content
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(htmlContent);
      previewWindow.document.close();
    } else {
      console.error("Could not open preview window. Please check if pop-ups are blocked.");
    }
  } catch (error) {
    console.error("Error previewing resume:", error);
  }
};
