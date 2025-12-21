/**
 * Cleans text content pasted from AI chatbots or other sources
 * Removes hidden characters, normalizes whitespace, and preserves markdown formatting
 */
export function cleanTextContent(text: string): string {
    if (!text) return '';

    // If it's HTML, we don't want to perform aggressive line-by-line trimming 
    // or newline manipulation which might break tags or specific spacing.
    const isHtml = /<[a-z][\s\S]*>/i.test(text);
    if (isHtml) return text.trim();

    let cleaned = text;

    // Remove zero-width characters and other invisible Unicode characters
    cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, '');

    // Remove BOM (Byte Order Mark)
    cleaned = cleaned.replace(/^\uFEFF/, '');

    // Remove other control characters except newlines and tabs
    cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Normalize different types of spaces to regular space
    cleaned = cleaned.replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ');

    // Normalize line breaks (convert \r\n and \r to \n)
    cleaned = cleaned.replace(/\r\n/g, '\n');
    cleaned = cleaned.replace(/\r/g, '\n');

    // Remove excessive blank lines (more than 2 consecutive newlines)
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // Trim whitespace from each line while preserving indentation for code blocks
    cleaned = cleaned.split('\n').map(line => line.trimEnd()).join('\n');

    // Trim leading and trailing whitespace from the entire content
    cleaned = cleaned.trim();

    return cleaned;
}

/**
 * Sanitizes text for display, ensuring safe rendering
 */
export function sanitizeForDisplay(text: string): string {
    if (!text) return '';

    // First clean the text
    let sanitized = cleanTextContent(text);

    // Additional display-specific cleaning can be added here

    return sanitized;
}

/**
 * Strips markdown formatting from text to get a clean plain text version
 * Useful for snippets and previews
 */
export function stripMarkdown(text: string): string {
    if (!text) return '';

    let cleaned = text;

    // Remove code blocks
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

    // Remove bold and italic
    cleaned = cleaned.replace(/(\*\*|__)(.*?)\1/g, '$2');
    cleaned = cleaned.replace(/(\*|_)(.*?)\1/g, '$2');

    // Remove headers
    cleaned = cleaned.replace(/^#{1,6}\s+(.*)$/gm, '$1');

    // Remove links [text](url) -> text
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

    // Remove images ![alt](url) -> ""
    cleaned = cleaned.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '');

    // Remove blockquotes > 
    cleaned = cleaned.replace(/^\s*>\s+/gm, '');

    // Remove horizontal rules
    cleaned = cleaned.replace(/^-{3,}$|^\*{3,}$|^_{3,}$/gm, '');

    // Remove list markers
    cleaned = cleaned.replace(/^\s*[\*\-\+]\s+/gm, '');
    cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '');

    // Basic HTML tag removal if any mixed in
    cleaned = cleaned.replace(/<[^>]*>/g, '');

    return cleanTextContent(cleaned);
}
