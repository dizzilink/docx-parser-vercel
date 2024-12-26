import type { VercelRequest, VercelResponse } from '@vercel/node'
import docx2html from "./docx2html";
import html2json from "./html2json";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { fileUrl } = req.query;
  try {
    const docxhtml  = await docx2html(fileUrl);
    if(docxhtml && docxhtml.html){
      const docxjson = html2json(docxhtml.html);
      return res.json({ docxjson, docxhtml });
    }else{
      throw new Error("Error Parsing Html");
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}