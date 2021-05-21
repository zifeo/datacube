declare let BigQuery;
declare let Utilities;
declare let SpreadsheetApp;
declare let PropertiesService;

export const listProjects = () => {
  return BigQuery.Projects.list();
};

export const listDatasets = (projectId: string) => {
  return BigQuery.Datasets.list(projectId);
};

export const listTables = (projectId: string, datasetId: string) => {
  return BigQuery.Tables.list(projectId, datasetId);
};

export const getTable = (
  projectId: string,
  datasetId: string,
  tableId: string
) => {
  return BigQuery.Tables.list(projectId, datasetId, tableId);
};

export const set = (key: string, value: any) => {
  PropertiesService.getDocumentProperties().setProperty(key, value);
};

export const get = (key: string) => {
  return PropertiesService.getDocumentProperties().getProperty(key);
};

export const clean = () => {
  PropertiesService.getDocumentProperties().deleteAllProperties();
};

export const query = (projectId: string, sql: string, dryRun: boolean) => {
  const request = {
    query: sql,
    timeoutMs: 10000,
    dryRun,
    useQueryCache: true,
    useLegacySql: false,
    maximumBytesBilled: 100_000_000,
  };

  let results = BigQuery.Jobs.query(request, projectId);
  const {
    totalRows,
    totalBytesProcessed,
    cacheHit,
    jobReference: { jobId },
  } = results;

  let sleepTimeMs = 500;
  while (!results.jobComplete) {
    Utilities.sleep(sleepTimeMs);
    sleepTimeMs *= 2;
    results = BigQuery.Jobs.getQueryResults(projectId, jobId);
  }

  let { rows } = results;
  while (results.pageToken) {
    results = BigQuery.Jobs.getQueryResults(projectId, jobId, {
      pageToken: results.pageToken,
    });
    rows = rows.concat(results.rows);
  }

  if (rows) {
    const sheet = SpreadsheetApp.getActiveSheet();

    const data = new Array(rows.length + 1);
    data[0] = results.schema.fields.map(field => field.name);

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

  return {
    totalRows,
    totalBytesProcessed,
    cacheHit,
  };
};
