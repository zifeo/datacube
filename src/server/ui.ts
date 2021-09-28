declare let SpreadsheetApp;
declare let HtmlService;

export const onOpen = () => {
  const menu = SpreadsheetApp.getUi()
    .createMenu('DataCube')
    .addItem('BigQuery', 'openSidebar');

  menu.addToUi();
};

export const openSidebar = () => {
  const html =
    HtmlService.createHtmlOutputFromFile('panel').setTitle('BigQuery Editor');
  SpreadsheetApp.getUi().showSidebar(html);
};
