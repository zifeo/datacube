import * as publicUiFunctions from './ui';
import * as publicBigQueryFunctions from './bigquery';

declare var global;

global.onOpen = publicUiFunctions.onOpen;
global.openSidebar = publicUiFunctions.openSidebar;

global.TEST = publicBigQueryFunctions.TEST;

/**
 * Multiplies the input value by 2.
 *
 * @param {number} input The value to multiply.
 * @return The input multiplied by 2.
 * @customfunction
 */
global.DOUBLE = input => input * 2;
