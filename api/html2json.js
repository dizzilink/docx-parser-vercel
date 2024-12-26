import * as cheerio from 'cheerio';

function html2json(htmlString) {
    const $ = cheerio.load("<body>" + htmlString + "</body>");
    const result = [];
    $('body > table').each((index, table) => {
        const tableData = [];
        $(table).children('tbody').each((i, tbody) => {
            $(tbody).children('tr').each((i, row) => {
                const rowData = [];
                $(row).children('td').each((i, cell) => {
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
        });
        result.push(tableData);
    });
    return result;
}
export default html2json;
