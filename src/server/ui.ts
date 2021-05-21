declare var SpreadsheetApp;
declare var HtmlService;

export const onOpen = () => {
  const menu = SpreadsheetApp.getUi()
    .createMenu('BigQuery')
    .addItem('Editor', 'openSidebar');

  menu.addToUi();
};

export const openSidebar = () => {
  const html = HtmlService.createHtmlOutputFromFile('panel').setTitle(
    'BigQuery Editor'
  );
  SpreadsheetApp.getUi().showSidebar(html);
};
