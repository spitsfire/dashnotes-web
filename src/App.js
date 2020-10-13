import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { render } from '@testing-library/react';
import { config } from './Constants'
const axios = require('axios').default;

const URL = config.url.API_URL

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      stickies: [],
      newStickyBody: ''
    }
  }

  componentDidMount() {
    const code =
      window.location.href.match(/\/?code=(.*)/) &&
      window.location.href.match(/\/?code=(.*)/)[1];

    const token = localStorage.getItem('DASHNOTES_AUTH_CODE');

    if (token) {

      axios.get(`${URL}/users`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      .then((response) => {
        this.setState({
          name: response.data.name,
          username: response.data.username,
          avatar_url: response.data.avatar_url
        });
      })
      .catch((e) => { console.log('getting details about the user from be didn\'t work', e); });
    } else if (code) {
      axios.post(`${URL}/auth/callback/gh/${code}`, {
        code: code,
      }, {
        headers: { "Access-Control-Allow-Headers": "X-Requested-With, content-type" }
      })
      .then((response) => {
        this.setState({
          name: response.data.name,
          username: response.data.username,
          avatar_url: response.data.avatar_url
        });
        localStorage.setItem('DASHNOTES_AUTH_CODE', response.data.auth_code);
      })
      .catch((e) => { console.log("going through gh oauth cycle without saved login info didn't work", e);})
    } else {
      console.log("no login info saved, or haven't just gone through gh oauth callback");
    }
  }

  getStickies() {
    const token = localStorage.getItem('DASHNOTES_AUTH_CODE')
    axios.get(`${URL}/stickies`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    .then((response) => {
      this.setState({
        stickies: response.data.stickies
      })
    })
    .catch((e) => { console.log("getting all stickies didn't work", e); });
  }

  getMyStickies() {
    const token = localStorage.getItem('DASHNOTES_AUTH_CODE')
    axios.get(`${URL}/my-stickies`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    .then((response) => {
      this.setState({
        stickies: response.data.stickies
      })
    })
    .catch((e) => { console.log("getting my stickies didn't work", e); });
  }
  
  onGetStickiesClick = (event) => {
    this.getStickies();
  }

  onLogoutButtonClick = (event) => {
    localStorage.removeItem('DASHNOTES_AUTH_CODE');
  }

  onSubmitNewSticky = (event) => {
    if (this.state.newStickyBody === '') { return; }
    event.preventDefault();

    const token = localStorage.getItem('DASHNOTES_AUTH_CODE')
    axios.post(`${URL}/my-stickies`, {
      body: this.state.newStickyBody
    }, {
      headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }})
    .then((response) => {
      this.setState({
        stickies: [...this.state.stickies, response.data.sticky]
      })
    })
    .catch((e) => { console.log("creating a new sticky didn't work", e); });
  }

  onClickMyStickies = (event) => {
    this.getMyStickies();
  }

  onChangeNewStickyBody = (event) => {
    this.setState({
      newStickyBody: event.target.value
    })
  }

  render() {
    const stickies = this.state.stickies.map( (sticky) => {
      return (<li>
        <p>{sticky.body}</p>
        <p>{sticky.username}</p>
      </li>)
    })

    const CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID

    return (
      <div>
        <h1>{this.state.name}</h1>
        <h2>{this.state.username}</h2>
        <img src={this.state.avatar_url} alt="lol" />
        <p>{this.state.token}</p>
        <a
            href={`https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}`}
          >Login to GitHub</a>
        <button onClick={this.onLogoutButtonClick}>BUTTON LOGOUT</button>


        <form onSubmit={this.onSubmitNewSticky}>
          <label htmlFor="new-sticky">New sticky</label>
          <input type="text" onChange={this.onChangeNewStickyBody} name="new-sticky"></input>
          <input type="submit"></input>
        </form>

        <button onClick={this.onClickMyStickies}>Get MY Stickies</button>
        <button onClick={this.onGetStickiesClick}>Get ALL Stickies</button>

        <h2>Stickies</h2>
        <ul>
          {stickies}
        </ul>

      </div>
    );
  }
}

export default App;
