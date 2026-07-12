/**
 * src/utils/csvExport.js
 * CSV streaming utility using csv-stringify.
 * Used by the reports module to stream CSV responses.
 */

const { stringify } = require('csv-stringify');

/**
 * Stream an array of objects as a CSV file in the HTTP response.
 * @param {import('express').Response} res
 * @param {object[]} data        - Array of plain objects to serialize
 * @param {string}   filename    - Suggested download filename (without .csv extension)
 * @param {string[]} [columns]   - Optional ordered column list; defaults to object keys
 */
function streamCSV(res, data, filename, columns = null) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
  res.setHeader('Transfer-Encoding', 'chunked');

  const options = {
    header: true,
    ...(columns ? { columns } : {}),
  };

  const stringifier = stringify(options);

  stringifier.on('error', (err) => {
    console.error('[CSV Export] Stringify error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: { code: 'CSV_ERROR', message: err.message } });
    }
  });

  stringifier.pipe(res);

  for (const row of data) {
    stringifier.write(row);
  }

  stringifier.end();
}

module.exports = { streamCSV };
