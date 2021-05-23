import { atom } from 'recoil';
import { format } from 'sql-formatter';

const isProduction = process.env.NODE_ENV === 'production';

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

export const states = {
  project,
  projects,
  completions,
  sql,
};
