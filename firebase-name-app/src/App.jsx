import React, { Component } from 'react';
import firebase from "firebase"
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
const database = firebase.database()

class App extends Component {
  constructor() {
    super()
    this.state = { names: [] }
    this.counter = 1
  }

  componentDidMount() {
    //so once returns an Object, not an array.
    //I want an array that I can assign to this.state.names. 
    //how to get? 
    database.ref("/names")
    .on(
      "child_added", a =>{
      console.log(a.val());
      this.setState(
        st => ({names:st.names.concat(a.val()) }))})
  }
  addName = (e) => {
    e.preventDefault()
    database.ref("/names").push()
      .set(this.inp.value,()=>{this.inp.value=""}
)
    // this.setState(st => ({ names: st.names.concat(this.inp.value) }))


  }
  render() {


    return (
      <div className="App">
        <ol>{this.state.names.map(val => { return <li>{val}</li> })}</ol>
        <form onSubmit={this.addName}>
          <input ref={r => this.inp = r} />
          <button type="submit">click me</button>
        </form>
      </div>
    );
  }
}

export default App;
