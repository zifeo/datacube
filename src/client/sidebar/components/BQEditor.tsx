import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import { makeStyles } from '@material-ui/core/styles';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/sql-hint';
import 'codemirror/mode/sql/sql';
import prettyBytes from 'pretty-bytes';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { format } from 'sql-formatter';
import server from '../../utils/server';
import { states } from '../states';
import { Actions } from './Actions';
import { CodeMirror } from './CodeMirror';
import { History } from './History';
import { ProjectSelector } from './ProjectSelector';

const { serverFunctions } = server;

const useStyles = makeStyles({
  box: {
    margin: 5,
  },
  alert: {
    fontSize: '0.9rem',
  },
});

function createQueryId() {
  return Math.floor(Math.random() * 1_000_000);
}

export const BQEditor = () => {
  const classes = useStyles();

  const [project] = useRecoilState(states.project);
  const [tables] = useRecoilState(states.completions);

  const [sql, setSQL] = useRecoilState(states.sql);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('Select a project or a query');

  const [queries, setQueries] = useRecoilState(states.queries);
  const [queryId, setQueryId] = useRecoilState(states.queryId);

  useEffect(() => {
    if (!queryId) {
      setQueryId(createQueryId())
    }
  }, [setQueryId]);
  
  const onQuery = async () => {
    setLoading(true);

    const { cacheHit, totalRows, totalBytesProcessed, error } =
      await serverFunctions.query(
        project && project.projectReference.projectId,
        sql,
        false
      );

    if (error) {
      setInfo(`Query error: ${error}`);
    } else {
      setInfo(
        `${totalRows} row${totalRows > 1 ? 's' : ''} from ${
          cacheHit ? 'cache' : prettyBytes(1 * totalBytesProcessed)
        }`
        );
      setQueries({...queries, [queryId]: {projectId: project.projectReference.projectId, sql}})
    }

    setLoading(false);
  };

  const onFormat = () => {
    setSQL(format(sql));
  };

  const onNew = () => {
    setQueryId(createQueryId())
  };

  const onClose = () => {
    setInfo('');
  };

  return (
    <Grid container>
      <Grid item xs={6}>
        <ProjectSelector />
      </Grid>
      <Grid item xs={6}>
        <Actions
          onQuery={onQuery}
          onNew={onNew}
          onFormat={onFormat}
          loading={loading}
        />
      </Grid>
      <Grid item xs={12}>
        <CodeMirror
          sql={sql}
          tables={tables}
          keys={{
            'Alt-F': onFormat,
            'Shift-Enter': onQuery,
          }}
          onChange={setSQL}
        />
      </Grid>
      <Grid item xs={12}>
        <History />
        <Snackbar
          open={info !== ''}
          autoHideDuration={5000}
          onClose={onClose}
          message={info}
          className={classes.alert}
        />
      </Grid>
    </Grid>
  );
};
