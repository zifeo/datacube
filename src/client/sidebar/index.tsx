import CssBaseline from '@material-ui/core/CssBaseline';
import React from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';
import { BQEditor } from './components/BQEditor';
import './styles.css';

const App = () => (
  <RecoilRoot>
    <CssBaseline />
    <BQEditor />
  </RecoilRoot>
);

ReactDOM.render(<App />, document.getElementById('index'));
