import React, { Component } from 'react';
import Table from './components/Table.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from './logo.svg';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cities: []
    }
  }

    componentDidMount() {
    	fetch('http://localhost:8080/cities')
    	.then(res => res.json())
    	.then(json => json)
    	.then(cities => this.setState({ 'cities': cities }))
    }

  render() {
    return (
      <div className="App">
      <nav className="navbar navbar-light bg-light">
                <a className="navbar-brand" href="./">
                  <img src={logo} alt="logo" width="40" /> City List
                </a>
              </nav>
        <Table cities={ this.state.cities }/>
      </div>
    );
  }
}

export default App;
