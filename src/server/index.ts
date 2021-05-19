import * as publicUiFunctions from './ui';
import * as publicBigQueryFunctions from './bigquery';

declare var global;

global.onOpen = publicUiFunctions.onOpen;
global.openSidebar = publicUiFunctions.openSidebar;

global.query = publicBigQueryFunctions.query;
global.listProjects = publicBigQueryFunctions.listProjects;
global.listDatasets = publicBigQueryFunctions.listDatasets;
global.listTables = publicBigQueryFunctions.listTables;
