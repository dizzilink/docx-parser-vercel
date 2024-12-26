import mammoth from 'mammoth';

async function docx2html(fileUrl) {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      const arrayBuffer = await response.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
      return {
        html : result.value,
        errors: result.messages
      }
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
}
export default docx2html;