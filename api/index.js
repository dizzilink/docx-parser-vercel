import mammoth from 'mammoth';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const { fileUrl } = req.query;

  async function docx2html(fileUrl) {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      const arrayBuffer = await response.arrayBuffer();
      const result = await mammoth.convertToHtml({ buffer: arrayBuffer }, {
        debug: true 
      });
      return {
        html: result.value,
        errors: result.messages
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  function html2json(htmlString) {
    const $ = cheerio.load("<body>" + htmlString + "</body>");
    const result = [];
    $('body > table').each((index, table) => {
      const tableData = [];
      let $section = $(table).children('tbody');
      if ($section.length === 0) {
        $section = $(table).children('thead');
      }
      $section.children('tr').each((i, row) => {
        const rowData = [];
        let $cells = $(row).children('td');
        if ($cells.length === 0) {
          $cells = $(row).children('th');
        }
        $cells.each((i, cell) => {
          const nestedTable = $(cell).find('table');
          if (nestedTable.length > 0) {
            nestedTable.each((i, nested) => {
              $(nested).attr('style', 'border-collapse: collapse;');
              $(nested).attr('border', '1');
            });
          }
          $(cell).find('p').each((i, p) => {
            const text = $(p).html();
            const isNextParagraph = $(p).next(':not(text)').is('p');
            $(p).replaceWith(text + (isNextParagraph ? '\n' : ''));
          });
          rowData.push($(cell).html().trim());
        });
        tableData.push(rowData);
      });
      result.push(tableData);
    });
    return result;
  }
  try {
    const docxhtml = await docx2html(fileUrl);
    if (docxhtml && docxhtml.html) {
      const docxjson = html2json(docxhtml.html);
      return res.json({ docxjson, docxhtml });
    } else {
      throw new Error("Error Parsing Html");
    }
  } catch (error) {
    return res.json({ error : error.message });
  }
}