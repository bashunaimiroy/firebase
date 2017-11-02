import React, { Component } from 'react';
import firebase from "firebase";
import Chatbox from "./components/Chatbox.js"
import { BrowserRouter, Route, Link } from "react-router-dom"
// import havana from './images/havana.jpg';

import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = { chatNum: 1 }
  }
setName = () => {
  console.log("changing this.state.username value")
  this.setState({userName:this.nameInp.value})
}
//this is a function that will be called from inside the Chatbox component by chat chooser buttons.
//therefore, I'm using arrow notation to bind the "This" to the parent app.js component here, so that
//it will set the state.chatNum of this parent component.
chooseChat = (number) =>{
  console.log("changing this.state.chatNum")
  this.setState({chatNum:number})
}

  render() {

    return (
      <BrowserRouter>


        <div className="container">
          <h2>BashuChat</h2>
          <Route path="/chat" render={() => {
            return (
            
              <Chatbox chatroom={this.state.chatNum} name={this.state.userName} chooseChat={this.chooseChat}>
            </Chatbox>)
          }
          } />
          <Route exact={true} path="/" render={() => {return (<div>
            <input ref={r => this.nameInp = r} placeholder="please enter a username" onChange={this.setName} />
            <Link to="/chat" className="name-button">Chat</Link>
          </div>)}} />



        </div>

      </BrowserRouter>
    );
  }
}

export default App;
