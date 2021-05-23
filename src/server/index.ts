import * as publicBigQueryFunctions from './bigquery';
import * as publicStorageFunctions from './storage';
import * as publicUiFunctions from './ui';

declare let global;

global.onOpen = publicUiFunctions.onOpen;
global.openSidebar = publicUiFunctions.openSidebar;

global.query = publicBigQueryFunctions.query;
global.listProjects = publicBigQueryFunctions.listProjects;
global.listDatasets = publicBigQueryFunctions.listDatasets;
global.listTables = publicBigQueryFunctions.listTables;
global.getTable = publicBigQueryFunctions.getTable;
global.get = publicStorageFunctions.get;
global.set = publicStorageFunctions.set;
global.clear = publicStorageFunctions.clear;
global.remove = publicStorageFunctions.remove;
