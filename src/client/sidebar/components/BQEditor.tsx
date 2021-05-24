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
import { useDebouncedCallback } from 'use-debounce';
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
  header: {
    height: 40,
  },
  main: {
    height: 'calc(100% - 40px - 300px)',
  },
  footer: {
    height: 300,
    overflowY: 'scroll',
  },
});

function createQueryId() {
  return new Date().toISOString();
}

export const BQEditor = () => {
  const classes = useStyles();

  const [project] = useRecoilState(states.project);
  const [tables, setTables] = useRecoilState<Record<string, Array<string>>>(
    states.completions
  );
  const [sql, setSQL] = useRecoilState<string>(states.sql);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('Select a project or a query');

  const [queries, setQueries] = useRecoilState(states.queries);
  const [queryId, setQueryId] = useRecoilState(states.queryId);

  const checkCompletions = useDebouncedCallback(async () => {
    // eslint-disable-next-line no-restricted-syntax
    for (const [word, cols] of Object.entries(tables)) {
      if (cols.length === 0 && sql.includes(word)) {
        const [dataset, table] = word.split('.');
        // eslint-disable-next-line no-await-in-loop
        const { schema } = await serverFunctions.getTable(
          project.projectReference.projectId,
          dataset,
          table
        );
        const columns = schema.fields.map((f) => f.name);
        setTables({ ...tables, [word]: columns });
      }
    }
  }, 500);

  useEffect(() => {
    if (!queryId) {
      setQueryId(createQueryId());
    }
  }, [queryId, setQueryId]);

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
      setQueries({
        ...queries,
        [queryId]: { projectId: project.projectReference.projectId, sql },
      });
    }

    setLoading(false);
  };

  const onFormat = () => {
    setSQL(format(sql));
  };

  const onNew = () => {
    setQueryId(createQueryId());
    setSQL('');
  };

  const onChange = async (text: string) => {
    setSQL(text);
    checkCompletions();
  };

  const onClose = () => {
    setInfo('');
  };

  return (
    <Grid container>
      <Grid item xs={6} className={classes.header}>
        <ProjectSelector />
      </Grid>
      <Grid item xs={6} className={classes.header}>
        <Actions
          onQuery={onQuery}
          onNew={onNew}
          onFormat={onFormat}
          loading={loading}
        />
      </Grid>
      <Grid item xs={12} className={classes.main}>
        <CodeMirror
          sql={sql}
          tables={tables}
          keys={{
            'Ctrl-C': onFormat,
            'Ctrl-N': onNew,
            'Shift-Enter': onQuery,
          }}
          onChange={onChange}
        />
      </Grid>
      <Grid item xs={12} className={classes.footer}>
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
