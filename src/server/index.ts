import * as publicUiFunctions from './ui';
import * as publicBigQueryFunctions from './bigquery';

declare var global;

global.onOpen = publicUiFunctions.onOpen;
global.openSidebar = publicUiFunctions.openSidebar;

global.TEST = publicBigQueryFunctions.TEST;
global.listProjects = publicBigQueryFunctions.listProjects;
