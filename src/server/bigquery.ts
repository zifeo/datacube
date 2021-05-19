declare var BigQuery;

export const listProjects = () => {
  const projects = BigQuery.Projects.list();
  Logger.log(projects);
  return projects;
};

export const listDatasets = projectId => {
  const datasets = BigQuery.Datasets.list(projectId);
  Logger.log(datasets);
  return datasets;
};

export const listTables = (projectId, datasetId) => {
  const tables = BigQuery.Tables.list(projectId, datasetId);
  Logger.log(tables);
  return tables;
};

export const query = (projectId, sql) => {
  const request = {
    query: sql,
    useLegacySql: false,
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

    const data = new Array(rows.length + 1);
    data[0] = queryResults.schema.fields.map(field => field.name);

    for (let i = 0; i < rows.length; i += 1) {
      const cols = rows[i].f;
      data[i + 1] = new Array(cols.length);
      for (let j = 0; j < cols.length; j += 1) {
        data[i + 1][j] = cols[j].v;
      }
    }

    const currentRange = SpreadsheetApp.getActiveRange();
    const [row, col] = currentRange
      ? [currentRange.getRow(), currentRange.getColumn()]
      : [1, 1];

    sheet.getRange(row, col, rows.length + 1, data[0].length).setValues(data);
  }
};
