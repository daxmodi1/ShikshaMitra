// Text formatting utilities for better response display

export const formatResponseText = (text) => {
  // Split into lines
  const lines = text.split('\n').filter(line => line.trim());
  const result = [];
  let currentList = [];
  let currentListType = null;
  let currentParagraph = [];

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    
    // Detect bullet point
    if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
      if (currentParagraph.length > 0) {
        result.push({ type: 'paragraph', text: currentParagraph.join(' '), key: result.length });
        currentParagraph = [];
      }
      if (currentListType !== 'bullet') {
        if (currentList.length > 0) {
          result.push({ type: 'list', items: currentList, key: result.length });
        }
        currentList = [];
        currentListType = 'bullet';
      }
      currentList.push(trimmedLine.replace(/^[•-]\s*/, ''));
    }
    // Detect numbered list
    else if (/^\d+\.\s/.test(trimmedLine)) {
      if (currentParagraph.length > 0) {
        result.push({ type: 'paragraph', text: currentParagraph.join(' '), key: result.length });
        currentParagraph = [];
      }
      if (currentListType !== 'ordered') {
        if (currentList.length > 0) {
          result.push({ type: 'list', items: currentList, key: result.length });
        }
        currentList = [];
        currentListType = 'ordered';
      }
      currentList.push(trimmedLine.replace(/^\d+\.\s*/, ''));
    }
    // Detect bold/header (lines with **)
    else if (trimmedLine.includes('**')) {
      if (currentList.length > 0) {
        result.push({ type: currentListType === 'ordered' ? 'ordered-list' : 'list', items: currentList, key: result.length });
        currentList = [];
        currentListType = null;
      }
      if (currentParagraph.length > 0) {
        result.push({ type: 'paragraph', text: currentParagraph.join(' '), key: result.length });
        currentParagraph = [];
      }
      result.push({ type: 'header', text: trimmedLine.replace(/\*\*/g, ''), key: result.length });
    }
    // Regular paragraph
    else if (trimmedLine.length > 0) {
      if (currentList.length > 0) {
        result.push({ type: currentListType === 'ordered' ? 'ordered-list' : 'list', items: currentList, key: result.length });
        currentList = [];
        currentListType = null;
      }
      currentParagraph.push(trimmedLine);
    }
  });

  // Push remaining items
  if (currentList.length > 0) {
    result.push({ type: currentListType === 'ordered' ? 'ordered-list' : 'list', items: currentList, key: result.length });
  }
  if (currentParagraph.length > 0) {
    result.push({ type: 'paragraph', text: currentParagraph.join(' '), key: result.length });
  }

  return result;
};

export const renderFormattedResponse = (text) => {
  const formatted = formatResponseText(text);

  return formatted.map((block) => {
    switch (block.type) {
      case 'header':
        return (
          <h3 key={block.key} className="font-semibold text-sm mt-2 mb-1">
            {block.text}
          </h3>
        );

      case 'list':
        return (
          <ul key={block.key} className="list-disc list-inside space-y-1 my-2 ml-2">
            {block.items.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        );

      case 'ordered-list':
        return (
          <ol key={block.key} className="list-decimal list-inside space-y-1 my-2 ml-2">
            {block.items.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed">
                {item}
              </li>
            ))}
          </ol>
        );

      default:
        return (
          <p key={block.key} className="text-sm leading-relaxed my-2">
            {block.text}
          </p>
        );
    }
  });
};
