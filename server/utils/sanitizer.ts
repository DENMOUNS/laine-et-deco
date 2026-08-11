export const DOMPurify = {
  sanitize(text: string): string {
    if (typeof text !== 'string') return '';
    
    let result = text;
    // Strip script elements
    result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // Strip iframe elements
    result = result.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    // Strip style elements
    result = result.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Remove onEvent handlers or javascript: URIs (case insensitive)
    result = result.replace(/\bon\w+\s*=\s*['"][^'"]*['"]/gi, '');
    result = result.replace(/\bon\w+\s*=\s*`[^`]*`/gi, '');
    result = result.replace(/\bon\w+\s*=\s*[^\s>]+/gi, '');
    result = result.replace(/javascript\s*:\s*[^"'>\s]+/gi, '');

    return result;
  }
};

export default DOMPurify;
