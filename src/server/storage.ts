declare let PropertiesService;

export const set = (key: string, value: any) => {
  PropertiesService.getDocumentProperties().setProperty(key, value);
};

export const get = (key: string) => {
  return PropertiesService.getDocumentProperties().getProperty(key);
};

export const remove = (key: string) => {
  PropertiesService.getDocumentProperties().deleteProperty(key);
};

export const clear = () => {
  PropertiesService.getDocumentProperties().deleteAllProperties();
};
