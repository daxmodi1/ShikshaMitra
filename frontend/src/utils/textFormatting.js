// Text formatting utilities for better response display

export const formatResponseText = (text) => {
  // Split by double newlines to get paragraphs
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  
  return paragraphs.map((paragraph, idx) => {
    // Check if it's a bullet point list
    if (paragraph.includes('•') || paragraph.includes('-')) {
      return {
        type: 'list',
        items: paragraph.split('\n').filter(line => line.trim()),
        key: idx
      };
    }
    
    // Check if it's a numbered list
    if (/^\d+\./.test(paragraph)) {
      return {
        type: 'ordered-list',
        items: paragraph.split('\n').filter(line => line.trim()),
        key: idx
      };
    }
    
    // Regular paragraph
    return {
      type: 'paragraph',
      text: paragraph,
      key: idx
    };
  });
};

export const renderFormattedResponse = (text) => {
  const formatted = formatResponseText(text);
  
  return formatted.map((block) => {
    switch (block.type) {
      case 'list':
        return (
          <ul key={block.key} className="list-disc list-inside space-y-1 my-2">
            {block.items.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed">
                {item.replace(/^[•-]\s*/, '')}
              </li>
            ))}
          </ul>
        );
      
      case 'ordered-list':
        return (
          <ol key={block.key} className="list-decimal list-inside space-y-1 my-2">
            {block.items.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed">
                {item.replace(/^\d+\.\s*/, '')}
              </li>
            ))}
          </ol>
        );
      
      default:
        return (
          <p key={block.key} className="text-sm leading-relaxed my-1 whitespace-pre-wrap">
            {block.text}
          </p>
        );
    }
  });
};
