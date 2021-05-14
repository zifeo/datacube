import React from 'react';

/*

 <script>
              function query()
              {
                  var sql = document.getElementById("sql").value;
                  google.script.run.TEST(sql)
              }
          </script>

          */

import server from '../../utils/server';
const { serverFunctions } = server;
class About extends React.Component {

  state = {
    sql: 'SELECT id.id, createdAt FROM db ORDER BY createdAt DESC LIMIT 1',
  }

  onclick = () => {
    console.log('running')
    const q = serverFunctions.TEST(this.state.sql)
    q.then(e => console.log(e)).catch(e => console.log(e))

  }
  
  render() {
    return (
      <div>
        <p>
          <b>☀️ React app inside a sidebar! ☀️</b>
        </p>
        <p>
          This is a very simple page demonstrating how to build a React app inside a
          sidebar.
        </p>
        <p>
          Visit the Github repo for more information on how to use this project.
        </p>
        <p>- Elisha Nuchi</p>
        <a
          href="https://www.github.com/enuchi/React-Google-Apps-Script"
          target="_blank"
          rel="noopener noreferrer"
        >
          React + Google Apps Script
        </a>
        <div>
          <textarea value={this.state.sql} />
          <br/>
          <button onClick={this.onclick}>Send</button>
         
        </div>
      </div>
    );
  }
}

export default About;
