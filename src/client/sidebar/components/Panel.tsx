import React, { useState, useEffect } from 'react';
import { Button } from '@material-ui/core';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { format } from 'sql-formatter';
import { Controlled as CodeMirror } from 'react-codemirror2';

import server from '../../utils/server';
import 'codemirror/mode/sql/sql';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/sql-hint';

const { serverFunctions } = server;

const About = () => {
  const [sql, setSQL] = useState(
    format(
      'SELECT id.id, createdAt FROM db ORDER BY createdAt DESC LIMIT 1'
    )
  );
  const [projects, setProjects] = useState([]);
  const [completions, setCompletions] = useState({});
  const [project, setProject] = useState('');

  const changeProject = async (event: React.ChangeEvent<{ value: any }>) => {
    const projectId = event.target.value;
    setProject(projectId);
    const datasets = await serverFunctions
      .listDatasets(projectId)
      .then(r => r.datasets);
    const tables = await Promise.all(
      datasets.map(dataset =>
        serverFunctions
          .listTables(projectId, dataset.datasetReference.datasetId)
          .then(r => r.tables)
      )
    );
    const compls = Object.fromEntries(
      tables
        .flat()
        .map((table: any) => [
          `${table.tableReference.datasetId}.${table.tableReference.tableId}`,
          {},
        ])
    );
    setCompletions(compls);
  };

  useEffect(() => {
    (async () => {
      const res = await serverFunctions.listProjects<any>(50);
      setProjects(res.projects);
    })();
  }, []);

  const onQuery = () => {
    serverFunctions.query(project, sql);
  };

  const onFormat = () => {
    setSQL(format(sql));
  };

  return (
    <div>
      <Select onChange={changeProject} value={project}>
        {projects.map(p => (
          <MenuItem key={p.id} value={p.id}>
            {p.friendlyName}
          </MenuItem>
        ))}
      </Select>
      <br />
      <br />

      <br />
      <CodeMirror
        value={sql}
        options={{
          mode: 'text/x-mysql',
          hintOptions: {
            tables: completions,
            completeSingle: false,
          },
          extraKeys: {
            Tab: editor => {
              editor.replaceSelection('  ', 'end');
            },
            'Alt-F': onFormat,
            'Shift-Enter': onQuery,
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
          setSQL(value);
        }}
      />
      <br />
      <Button onClick={onQuery}>
        Run<small>(⇧+⏎)</small>
      </Button>
      <Button onClick={onFormat}>
        Format<small>(Alt+F)</small>
      </Button>
    </div>
  );
};

export default About;
