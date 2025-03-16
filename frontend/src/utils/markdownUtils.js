/**
 * Utility functions for markdown processing and PDF generation
 */

/**
 * Extracts canvas content from text by finding code blocks
 * @param {string} text - The text to extract content from
 * @returns {Array} - Array of parts with type 'normal' or 'code'
 */
export const extractCanvasContent = (text) => {
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

/**
 * Converts markdown to HTML
 * @param {string} markdown - The markdown text to convert
 * @returns {string} - The HTML string
 */
export const convertMarkdownToHTML = (markdown) => {
  if (!markdown) return '';
  // Markdown conversion logic
  return markdown;
};

/**
 * Converts markdown to PDF-ready HTML
 * @param {string} markdownText - The markdown text to convert
 * @returns {string} - The HTML string with styling for PDF
 */
export const convertMarkdownToPDF = (markdownText) => {
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
