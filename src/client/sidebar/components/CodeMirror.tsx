import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/sql-hint';
import 'codemirror/mode/sql/sql';
import React from 'react';
import { Controlled } from 'react-codemirror2';

interface Props {
  sql: string;
  tables: Record<string, Array<string>>;
  onChange: (string) => void;
  keys: Record<string, (string) => void>;
}

export const CodeMirror = ({ sql, tables, onChange, keys }: Props) => {
  return (
    <Controlled
      value={sql}
      options={{
        mode: 'text/x-sql',
        hintOptions: {
          tables,
          completeSingle: false,
        },
        lineWrapping: true,
        extraKeys: {
          Tab: (editor) => {
            editor.replaceSelection('  ', 'end');
          },
          'Ctrl-Space': 'autocomplete',
          ...keys,
        },
      }}
      onChange={(editor, data) => {
        const { origin, text } = data;
        const reg = /[a-z0-9]/i;
        if (origin === '+input' && (reg.test(text) || text[0] === '.')) {
          editor.showHint();
        }
      }}
      onBeforeChange={(editor, data, value) => {
        onChange(value);
      }}
    />
  );
};
