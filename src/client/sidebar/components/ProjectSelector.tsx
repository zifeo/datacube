import CircularProgress from '@material-ui/core/CircularProgress';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import server from '../../utils/server';
import { states } from '../states';

const { serverFunctions } = server;

const useStyles = makeStyles({
  box: {
    margin: 5,
  },
  select: {
    width: '100%',
    fontSize: '0.8rem',
    height: 30,
  },
  option: {
    fontSize: '0.8rem',
  },
});

async function fetchProjects() {
  const { projects } = await serverFunctions.listProjects();
  const fetchDatasets = projects.map(async (project) => {
    const { datasets } = await serverFunctions.listDatasets(
      project.projectReference.projectId
    );
    return datasets ? { ...project, datasets } : null;
  });
  const projectsWithDatasets = await Promise.all(fetchDatasets);
  return projectsWithDatasets.filter((p) => p);
}

async function fetchCompletions(project) {
  const { datasets } = await serverFunctions.listDatasets(
    project.projectReference.projectId
  );
  const fetchTables = datasets.map((dataset) =>
    serverFunctions
      .listTables(
        project.projectReference.projectId,
        dataset.datasetReference.datasetId
      )
      .then((r) => r.tables || null)
  );
  const tables = await Promise.all(fetchTables);
  return Object.fromEntries(
    tables
      .flat()
      .filter((t) => t)
      .map((table: any) => [
        `${table.tableReference.datasetId}.${table.tableReference.tableId}`,
        [],
      ])
  );
}

export const ProjectSelector = () => {
  const classes = useStyles();
  const [project, setProject] = useRecoilState(states.project);
  const [projects, setProjects] = useRecoilState(states.projects);
  const [completions, setCompletions] = useRecoilState(states.completions);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchProjects().then((bqProjects) => {
      setProjects(bqProjects);
      setLoading(false);
    });
  }, [setProjects]);

  useEffect(() => {
    (async () => {
      if (Object.keys(completions).length === 0 && project && project !== '') {
        const compls = await fetchCompletions(project);
        setCompletions(compls);
      }
    })();
  }, [completions, setCompletions, project]);

  const changeProject = async (event: React.ChangeEvent<{ value: any }>) => {
    setLoading(true);
    setCompletions({});
    const selectedProject = projects.find(
      (p) => p.projectReference.projectId === event.target.value
    );
    setProject(selectedProject);
    setLoading(false);
  };

  return (
    <div className={classes.box}>
      <Select
        variant="outlined"
        onChange={changeProject}
        value={project ? project.projectReference.projectId : ''}
        className={classes.select}
        disabled={loading}
        displayEmpty={true}
        renderValue={(v) => {
          if (loading) {
            return <CircularProgress size={18} />;
          }

          if (v === '') {
            return `${projects.length} projects`;
          }

          return v;
        }}
      >
        {projects.map((p) => (
          <MenuItem
            key={p.id}
            value={p.projectReference.projectId}
            className={classes.option}
          >
            {p.friendlyName} - {p.datasets.length} datasets
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};
