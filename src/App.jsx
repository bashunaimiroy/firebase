import React, { Component } from 'react';
import firebase from "firebase";
import './App.css';

var config = {
  apiKey: "AIzaSyC6Mdq8bYCdiZN7J1Kpuovj_FSASKbBMJg",
  authDomain: "my-beginner-project.firebaseapp.com",
  databaseURL: "https://my-beginner-project.firebaseio.com",
  projectId: "my-beginner-project",
  storageBucket: "my-beginner-project.appspot.com",
  messagingSenderId: "321603513191"
};
firebase.initializeApp(config);

class App extends Component {
  render() {
    return (<div></div>
         );
  }
}

export default App;
