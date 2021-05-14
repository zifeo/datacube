declare var SpreadsheetApp;
declare var HtmlService;

export const onOpen = () => {
  const menu = SpreadsheetApp.getUi()
    .createMenu('DataCube')
    .addItem('Editor', 'openSidebar');

  menu.addToUi();
};

export const openSidebar = () => {
  const html = HtmlService.createHtmlOutputFromFile('panel');
  SpreadsheetApp.getUi().showSidebar(html);
};
