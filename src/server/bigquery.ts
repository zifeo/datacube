declare var BigQuery;

/**
 * Multiplies the input value by 2.
 *
 * @param {number} input The value to multiply.
 * @return The input multiplied by 2.
 * @customfunction
 */
export const TEST = query => {
  const projectId = '';

  const request = {
    query,
  };
  let queryResults = BigQuery.Jobs.query(request, projectId);
  const { jobId } = queryResults.jobReference;

  // Check on status of the Query Job.
  let sleepTimeMs = 500;
  while (!queryResults.jobComplete) {
    Utilities.sleep(sleepTimeMs);
    sleepTimeMs *= 2;
    queryResults = BigQuery.Jobs.getQueryResults(projectId, jobId);
  }

  // Get all the rows of results.
  let { rows } = queryResults;
  while (queryResults.pageToken) {
    queryResults = BigQuery.Jobs.getQueryResults(projectId, jobId, {
      pageToken: queryResults.pageToken,
    });
    rows = rows.concat(queryResults.rows);
  }

  if (rows) {
    const sheet = SpreadsheetApp.getActiveSheet();

    // Append the headers.
    const headers = queryResults.schema.fields.map(field => {
      return field.name;
    });
    sheet.appendRow(headers);

    // Append the results.
    const data = new Array(rows.length);
    for (let i = 0; i < rows.length; i += 1) {
      const cols = rows[i].f;
      data[i] = new Array(cols.length);
      for (let j = 0; j < cols.length; j += 1) {
        data[i][j] = cols[j].v;
      }
    }
    sheet.getRange(2, 1, rows.length, headers.length).setValues(data);

    Logger.log('Results spreadsheet updated');
  } else {
    Logger.log('No rows returned.');
  }
};
