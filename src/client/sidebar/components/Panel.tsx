import React, { useState, useEffect } from 'react';
import { Button } from '@material-ui/core';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import { format } from 'sql-formatter';

import server from '../../utils/server';

const { serverFunctions } = server;

const About = () => {
  const [sql, setSQL] = useState(
    format(
      'SELECT id.id, createdAt FROM db ORDER BY createdAt DESC LIMIT 1'
    )
  );
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState('');

  const changeProject = (event: React.ChangeEvent<{ value: any }>) => {
    setProject(event.target.value);
  };

  const changeSQL = (event: React.ChangeEvent<{ value: any }>) => {
    setSQL(format(event.target.value));
  };

  useEffect(() => {
    (async () => {
      const res = await serverFunctions.listProjects<any>(50);
      // console.log(res);
      setProjects(res.projects);
    })();
  }, []);

  const onQuery = () => {
    // console.log(project, sql);
    serverFunctions.TEST(project, sql);
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
      <TextField
        multiline
        rows={20}
        value={sql}
        onChange={changeSQL}
        style={{ width: '100%' }}
      />
      <br />
      <br />
      <Button onClick={onQuery}>Run</Button>
    </div>
  );
};

export default About;
