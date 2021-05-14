declare var SpreadsheetApp;
declare var HtmlService;

export const onOpen = () => {
  const menu = SpreadsheetApp.getUi()
    .createMenu('DataCube')
    .addItem('BigQuery Editor', 'openSidebar');

  menu.addToUi();
};

export const openSidebar = () => {
  const html = HtmlService.createHtmlOutputFromFile('panel').setTitle(
    'BigQuery Editor'
  );
  SpreadsheetApp.getUi().showSidebar(html);
};
