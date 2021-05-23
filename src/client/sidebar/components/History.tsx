import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import React from 'react';

export const History = () => {
  return (
    <List dense>
      <Divider />
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
  );
};
