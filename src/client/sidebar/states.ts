import { atom, DefaultValue } from 'recoil';
import { format } from 'sql-formatter';
import server from '../utils/server';

const { serverFunctions } = server;

const isProduction = process.env.NODE_ENV === 'production';

const persistence =
  (key) =>
  ({ setSelf, onSet }) => {
    (async () => {
      const value = await serverFunctions.get(key);
      if (value !== null) {
        setSelf(JSON.parse(value));
      }
    })();

    onSet((newValue) => {
      if (newValue instanceof DefaultValue) {
        serverFunctions.removeItem(key);
      } else {
        serverFunctions.set(key, JSON.stringify(newValue));
      }
    });
  };

const sql = atom({
  key: 'sql',
  default: isProduction
    ? ''
    : format(
        'SELECT id.id, createdAt FROM db ORDER BY createdAt DESC LIMIT 1'
      ),
});

const project = atom({
  key: 'project',
  default: null,
});

const projects = atom({
  key: 'projects',
  default: [],
});

const completions = atom({
  key: 'completions',
  default: {},
});

const queries = atom({
  key: 'queries',
  default: {},
  effects_UNSTABLE: [persistence('queries')],
});

const queryId = atom({
  key: 'queryId',
  default: null,
});

export const states = {
  project,
  projects,
  completions,
  sql,
  queries,
  queryId,
};
