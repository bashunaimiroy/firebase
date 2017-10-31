import React, { Component } from 'react';
import firebase from "firebase";
// import bgImage from 'images/havana.jpg';
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
firebase.database.enableLogging(function (message) {
  console.log("[FIREBASE]", message);
});
const database = firebase.database()

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  //this is a function that 
  //1) sets the /text value in the database to the value of the input
  //2) then, the .then method takes the value of /text,
  //3) then, that method's .then sets the state.text of this React App to the returned value.
  textToDatabase = () => {
    console.log(this.inp.value)
    database.ref("/text").set({ text: this.inp.value })
    .then( () => {
        database.ref("/text").once("value")
        .then(
          (response) => {
            console.log(response.val)
            this.setState({ text: response.val().text })
          })
      }
    )
  }

  componentDidMount() {
    database.ref("/text").once('value').then(
      (response) => {
        console.log(response)
        this.setState({ text: response.val().text })
      }
    )
  }

  render() {
    return (

      <div className="container" style={{ background: "url(images/havana.jpg) no-repeat center" }}>
        <div className="inner-box">
          <h2>Text Area</h2>
          <div>{this.state.text}</div>
          <input ref={r => this.inp = r} placeholder="enter some text" />
          <button onClick={() => { this.textToDatabase() }}>Click Me</button>
        </div>
      </div>
    );
  }
}

export default App;
