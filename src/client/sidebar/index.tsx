import React from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Panel } from './components/Panel';

import "./styles.css"

const App = () => (
  <RecoilRoot>
    <CssBaseline />
    <Panel />
  </RecoilRoot>
);

ReactDOM.render(<App />, document.getElementById('index'));
