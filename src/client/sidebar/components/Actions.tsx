import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import React from 'react';

const useStyles = makeStyles({
  actions: {
    margin: 5,
    fontSize: '0.8rem',
  },
  run: {
    width: 45,
  },
});

interface Props {
  onQuery: () => void;
  onFormat: () => void;
  onNew: () => void;
  loading: boolean;
}

export const Actions = ({ onQuery, onFormat, onNew, loading }: Props) => {
  const classes = useStyles();

  return (
    <>
      <ButtonGroup size="small" className={classes.actions}>
        <Tooltip title="⇧+⏎">
          <Button onClick={onQuery} className={classes.run}>
            {loading ? <CircularProgress size={20} /> : 'Run'}
          </Button>
        </Tooltip>
        <Tooltip title="Ctrl+M">
          <Button onClick={onFormat}>Fmt</Button>
        </Tooltip>
        <Tooltip title="Ctrl+N">
          <Button onClick={onNew}>New</Button>
        </Tooltip>
      </ButtonGroup>
    </>
  );
};
