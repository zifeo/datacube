
declare var BigQuery;

/**
 * Multiplies the input value by 2.
 *
 * @param {number} input The value to multiply.
 * @return The input multiplied by 2.
 * @customfunction
 */
export const TEST = query => {

    var projectId = '';

    var request = {
        query: query
    };
    var queryResults = BigQuery.Jobs.query(request, projectId);
    var jobId = queryResults.jobReference.jobId;

    // Check on status of the Query Job.
    var sleepTimeMs = 500;
    while (!queryResults.jobComplete) {
        Utilities.sleep(sleepTimeMs);
        sleepTimeMs *= 2;
        queryResults = BigQuery.Jobs.getQueryResults(projectId, jobId);
    }

    // Get all the rows of results.
    var rows = queryResults.rows;
    while (queryResults.pageToken) {
        queryResults = BigQuery.Jobs.getQueryResults(projectId, jobId, {
        pageToken: queryResults.pageToken
        });
        rows = rows.concat(queryResults.rows);
    }

    if (rows) {
        var sheet = SpreadsheetApp.getActiveSheet();

        // Append the headers.
        var headers = queryResults.schema.fields.map(function(field) {
        return field.name;
        });
        sheet.appendRow(headers);

        // Append the results.
        var data = new Array(rows.length);
        for (var i = 0; i < rows.length; i++) {
        var cols = rows[i].f;
        data[i] = new Array(cols.length);
        for (var j = 0; j < cols.length; j++) {
            data[i][j] = cols[j].v;
        }
        }
        sheet.getRange(2, 1, rows.length, headers.length).setValues(data);

        Logger.log('Results spreadsheet updated');
    } else {
        Logger.log('No rows returned.');
    }
}
