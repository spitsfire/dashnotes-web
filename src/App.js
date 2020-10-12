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
      username: 'default',
      newSticky: ''
    }
  }

  componentDidMount() {
    const code =
      window.location.href.match(/\/?code=(.*)/) &&
      window.location.href.match(/\/?code=(.*)/)[1];
    if (code) {
      console.log(code);
      const CLIENT_ID = process.env.REACT_APP_GITHUB_CLIENT_ID;
      const CLIENT_SECRET = process.env.REACT_APP_GITHUB_CLIENT_SECRET;
      axios.post(`${URL}/whatever/github/${code}`, {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
      }, {
        headers: { "Access-Control-Allow-Headers": "X-Requested-With, content-type" }
      })
      .then((response) => {
        console.log('this should be just user data from our api now', response);
        this.setState({
          name: response.data.name,
          username: response.data.username,
          avatar_url: response.data.avatar_url
        });
      })
      .catch((e) => { console.log(e, "errrorr");})
    } else {
      console.log("NO CODE");
    }
  }

  getStickies() {
    const token = localStorage.getItem('REACT_TOKEN_AUTH')
    axios.get(`${URL}/stickies`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    .then((response) => {
      console.log('response', response);
      this.setState({
        stickies: response.data.stickies
      })
    })
    .catch((error) => {

    });
  }
  
  onGetStickiesClick = (event) => {
    this.getStickies();
  }

  onLoginButtonClick = (event) => {
    console.log(process.env.REACT_APP_GITHUB_CLIENT_SECRET)
    // const url = `https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}`
    
    // auth with BE logic and get a user auth_token. save it to localstorage
    const url = `${URL}/authenticate/${this.state.username}`

      axios.get(url, {
        headers: { 'Content-Type': 'application/json' }
      })
      .then((response) => {
        console.log('asfasdfasdf', response)
        // localStorage.setItem('REACT_TOKEN_AUTH', JSON.stringify(response.data.authenticate));
        localStorage.setItem('REACT_TOKEN_AUTH', response.data.authenticate);
      })
      .catch((error) => {
        console.log('nooo', error)
      });
  }

  onLogoutButtonClick = (event) => {
    localStorage.setItem('REACT_TOKEN_AUTH', null);
  }

  onChangeName = (event) => {
    this.setState({
      username: event.target.value
    })
  }

  getMyStickies() {
    const token = localStorage.getItem('REACT_TOKEN_AUTH')
    axios.get(`${URL}/my-stickies`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    .then((response) => {
      console.log('response', response);
      this.setState({
        stickies: response.data.stickies
      })
    })
    .catch((error) => {

    });
  }

  onSubmitNewSticky = (event) => {
    if (this.state.newSticky === '') { return; }
    event.preventDefault();

    console.log('lolololasfjlksdjf', this.state.newSticky);

    const token = localStorage.getItem('REACT_TOKEN_AUTH')
    axios.post(`${URL}/my-stickies`, {
      body: this.state.newSticky
    }, {
      headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }})
    .then((response) => {
      console.log('response', response);
      this.getMyStickies();
    })
    .catch((error) => {

    });
  }

  onClickMyStickies = (event) => {
    this.getMyStickies();
  }

  onChangeNewSticky = (event) => {
    this.setState({
      newSticky: event.target.value
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
        <input type="text" onChange={this.onChangeName}></input>
        <p>{this.state.token}</p>
        <a
            href={`https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}`}
          >Login to GitHub</a>
        <button onClick={this.onLoginButtonClick}>BUTTON LOGIN</button>
        <button onClick={this.onLogoutButtonClick}>BUTTON LOGOUT</button>


        <form onSubmit={this.onSubmitNewSticky}>
          <label htmlFor="new-sticky">New sticky</label>
          <input type="text" onChange={this.onChangeNewSticky} name="new-sticky"></input>
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
