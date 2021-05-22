import React, { useState, useEffect } from 'react';
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';
import { Editor } from './Editor';

import server from '../../utils/server';
import 'codemirror/mode/sql/sql';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/sql-hint';

const { serverFunctions } = server;

const useStyles = makeStyles({
  select: {
    margin: '10px 50px 15px 50px',
    width: 200,
  },
});

export const Panel = () => {
  const classes = useStyles();
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

  return (
    <Grid container>
      <Grid item xs={12}>
        <Select
          onChange={changeProject}
          value={project}
          className={classes.select}
        >
          {projects.map(p => (
            <MenuItem key={p.id} value={p.id}>
              {p.friendlyName}
            </MenuItem>
          ))}
        </Select>
      </Grid>
      <Grid item xs={12}>
        <Editor tables={completions} projectId={project} />
      </Grid>
      <Grid item xs={12}>
        <List dense>
          <ListItem button>
            <ListItemText primary="Inbox" />
          </ListItem>
          <Divider light />
          <ListItem button>
            <ListItemText primary="Drafts" />
          </ListItem>
          <Divider light />
          <ListItem button>
            <ListItemText primary="Trash" />
          </ListItem>
          <Divider light />
          <ListItem button>
            <ListItemText primary="Spam" secondary="date" />
          </ListItem>
        </List>
      </Grid>
    </Grid>
  );
};
