import * as publicUiFunctions from './ui';
import * as publicBigQueryFunctions from './bigquery';

declare let global;

global.onOpen = publicUiFunctions.onOpen;
global.openSidebar = publicUiFunctions.openSidebar;

global.query = publicBigQueryFunctions.query;
global.listProjects = publicBigQueryFunctions.listProjects;
global.listDatasets = publicBigQueryFunctions.listDatasets;
global.listTables = publicBigQueryFunctions.listTables;
global.getTable = publicBigQueryFunctions.getTable;
global.get = publicBigQueryFunctions.get;
global.set = publicBigQueryFunctions.set;
global.clean = publicBigQueryFunctions.clean;
