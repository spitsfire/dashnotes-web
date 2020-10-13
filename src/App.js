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
          user: {
            name: response.data.name,
            username: response.data.username,
            avatar_url: response.data.avatar_url
          }
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
          user: {
            name: response.data.name,
            username: response.data.username,
            avatar_url: response.data.avatar_url
          }
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
    this.setState({
      stickies: [],
      user: null
    })
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

        <nav>
          <ul>
            <li>
              <a href={`https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}`}>Login to GitHub</a>
            </li>
            <li>
              <button onClick={this.onLogoutButtonClick}>Log Out</button>
            </li>
          </ul>
        </nav>


        <section>
          <h1>Welcome{ this.state.user ? ` back, ${this.state.user.name} (${this.state.user.username})!` : '!'}</h1>
          { this.state.user ? <img src={this.state.user.avatar_url} alt="lol" /> : '' }
        </section>


        <section>
          <h2>My Stickies</h2>
          <button onClick={this.onClickMyStickies}>Get My Stickies</button>
          <ul>
            {stickies}
          </ul>
          <form onSubmit={this.onSubmitNewSticky}>
            <h3>
              <label htmlFor="new-sticky">Write a New Sticky</label>
            </h3>
            <input type="text" onChange={this.onChangeNewStickyBody} name="new-sticky"></input>
            <input type="submit"></input>
          </form>
        </section>


        <button onClick={this.onGetStickiesClick}>Get ALL Stickies</button>

      </div>
    );
  }
}

export default App;
