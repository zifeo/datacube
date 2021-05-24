import { IconButton, Typography } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import React from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { states } from '../states';

const useStyles = makeStyles({
  remove: {
    fontSize: '0.95rem',
    marginTop: -2,
    float: 'left',
  },
});

export const History = () => {
  const classes = useStyles();
  const [projects] = useRecoilState(states.projects);
  const setProject = useSetRecoilState(states.project);
  const setSQL = useSetRecoilState(states.sql);
  const setQueryId = useSetRecoilState(states.queryId);

  const [queries, setQueries] = useRecoilState<
    Record<string, Record<string, string>>
  >(states.queries);

  const onSelect = (selectedQueryId, projectId, sql) => () => {
    setQueryId(selectedQueryId);
    setSQL(sql);
    setProject(
      projects.find((p) => p.projectReference.projectId === projectId)
    );
  };

  const onRemove = (selectedQueryId: string) => () => {
    const { [selectedQueryId]: remove, ...newHistory } = queries;
    setQueries(newHistory);
  };

  return (
    <List dense>
      {Object.entries(queries).map(([currentQueryId, query]: any) => {
        return (
          <div key={currentQueryId}>
            <Divider />
            <ListItem button>
              <ListItemText>
                <IconButton size="small" onClick={onRemove(currentQueryId)}>
                  <DeleteIcon className={classes.remove} />
                </IconButton>
                <Typography
                  variant="caption"
                  onClick={onSelect(currentQueryId, query.projectId, query.sql)}
                >
                  {query.sql}
                </Typography>
              </ListItemText>
            </ListItem>
          </div>
        );
      })}
    </List>
  );
};
