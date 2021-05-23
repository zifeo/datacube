import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import React from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { states } from '../states';

export const History = () => {
  const [projects] = useRecoilState(states.projects);
  const setProject = useSetRecoilState(states.project);
  const setSql = useSetRecoilState(states.sql);
  const [queryId, setQueryId] = useRecoilState(states.queryId);

  const [queries] = useRecoilState(states.queries);
  console.log(queries);

  const onSelect = (queryId, projectId, sql) => () => {
    setQueryId(queryId)
    setSql(sql);
    setProject(projects.find((p) => p.project.projectReference.projectId === projectId));
  } 

  return (
    <List dense>
      {
      Object.entries(queries).map(([queryId, query]: any) => {

        return <div key={queryId}>
          <Divider />
          <ListItem button onClick={onSelect(queryId, query.projectId, query.sql)}>
            <ListItemText primary={queryId} secondary={query.sql} />
          </ListItem>
        </div>
      })
      }
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
  );
};
