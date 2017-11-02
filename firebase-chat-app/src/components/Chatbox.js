import React, { Component } from 'react';
import firebase from "firebase";
// import havana from './images/havana.jpg';

var config = {
  apiKey: "AIzaSyC6Mdq8bYCdiZN7J1Kpuovj_FSASKbBMJg",
  authDomain: "my-beginner-project.firebaseapp.com",
  databaseURL: "https://my-beginner-project.firebaseio.com",
  projectId: "my-beginner-project",
  storageBucket: "my-beginner-project.appspot.com",
  messagingSenderId: "321603513191"
}
firebase.initializeApp(config);
const database = firebase.database();

class Chatbox extends Component {
  //so state must contain messages, an array of objects each with a username and a text property. mb timestamp?
  constructor(props) {
    super(props)
    this.state = { messages: [], members: [] }
    this.props.name? this.name = this.props.name: this.name="anonymoose"
    

  }
  componentDidMount() {
    this.addListeners();
    console.log(
      "Chatbox component mounted and I added listeners to database chatroom " + this.props.chatroom)
  }

  componentDidUpdate(prevProps) {

    //this fires every time the component is re-rendered by the 
    //App.jsx parent component with a different chatroom
    //selected.
    if (prevProps !== this.props) {
      console.log(prevProps)
      console.log(this.props)
     
      console.log("updating with new props now, eh. Removing and Adding listeners.")
      //first it removes the listeners from the previously selected chatroom
      this.leaveChatroom(prevProps.chatroom)


      //then it empties the messages and members, 
      //then adds the listeners to the new chatroom's path, which will populate the chat
      //with messages and members
      this.setState({ messages: [], members: []},
        () => this.addListeners())
    }
  }
  //given a chatroom, removes the listeners for that chatroom in the database
  //which saves us from memory leaks from too many listeners.
  //it also tells the database that we've left this chatroom.

  leaveChatroom = (chatroom) => {
    this.removeListeners(chatroom);
    database.ref(`members/${chatroom}/${this.name}`).remove(
      console.log("hey I de-registered you from chatroom " + this.props.chatroom))
  }

  //removes listeners
  removeListeners = (chatroom) => {
    database.ref(`messages/${chatroom}`).off();
    database.ref(`chats/${chatroom}`).off();
    database.ref(`members/${chatroom}`).off()
    database.ref(`members/${chatroom}/${this.name}`).off()

  }




  addListeners = () => {
    // adds a database listener which will retrieve messages from the database and 
    //concatenate them to the state.messages array, and then continue listening for subsequent
    //added messages. 
    database.ref(`messages/${this.props.chatroom}`).on("child_added", (d) =>
      this.setState(st => ({ messages: st.messages.concat(d.val()) })))

    //also adds a database listener for users in this chatroom. 
    //whenever a member's value in this chatroom is switched to true, 
    //it concats their name (d.key) to this.state.members.
    //if it was switched to false, it removes them from the list.

    //(I can't help thinking this whole "keep their key in there", "true/false" thing
    //is less efficient than just pushing an entry for them and removing the entry on departure,
    //but there are reasons to not do the pushing method. Also I stole this true/false idea
    //from the firebase documentation.
    database.ref(`members/${this.props.chatroom}`).on("child_added", (d) => {
      console.log(d)
      this.setState(st => ({ members: st.members.concat(d.key)}))
    })
    database.ref(`members/${this.props.chatroom}`).on("child_removed", (d) => {

    })
      

  //Also adds a database listener for changes to the value of "isWriting", which is a string.
  //When that happens, it will set the state.isWriting to that string.
  database.ref(`chats/${this.props.chatroom}/isWriting`).on("value", (d) =>
    this.setState(st => ({ isWriting: d.val() })))
//finally it clears the value of "isWriting" in this chatroom in the database, so nobody starts off writing.
//this actually might not be the best representation of what I want
database.ref(`chats/${this.props.chatroom}/isWriting`).set(``)
//sets the value of this member in this chatroom in /members/ to true,
//letting the database know that I'm in here. This gets set to false when i disconnect.
database.ref(`members/${this.props.chatroom}/${this.name}`).set(true)
database.ref(`members/${this.props.chatroom}/${this.name}`).onDisconnect().remove()

  }
//upon form submitting, pushes a new child to the "messages/" path in the database, and sets that child
//to have three child key-value pairs relating to the message.
//clears the chatbox and resets the `messages/${this.state.chatNum}/isWriting` value in the database, 
//because clearing the chatbox isn't enough to trigger the onChange event listener.
sendMessage = (text, event) => {
  event.preventDefault();
  database.ref(`messages/${this.props.chatroom}`).push().set({ timestamp: Date.now(), text: this.inp.value, username: this.name })
  this.inp.value = "";
  database.ref(`chats/${this.props.chatroom}/isWriting`).set(``)

}

//if the input box's value changes, this checks if it has something and if so,
//assigns a string value to the database's isWriting path, announcing who's writing.

//If the input box has nothing in it, it clears the isWriting path. This is for when
//people erase a message from their input box.
somebodyIsWriting = e => {
  console.log("value changed!!!")
  if (e.target.value) {
    database.ref(`chats/${this.props.chatroom}/isWriting`).set(`${this.name} is writing...`)
  }
  else {
    database.ref(`chats/${this.props.chatroom}/isWriting`).set(``)

  }
}
//does two things sequentially: 
//1) sets the database "messages/" path to null,2)sets the state.messages to an empty array.
//it had to be this way because my child_added listener doesn't trigger
//if the whole parent gets deleted. Thankfully it remains there to listen when the 
//path starts getting filled with messages again.
clearChatbox = () => {
  database.ref(`messages/${this.props.chatroom}`).set(null, this.setState({ messages: [] }));

}

render() {

  return (<div>
    <div className="inner-box">
      <div className="chat-messages">
        <ul>
          {this.state.messages.map((msg) => <li key={msg.timestamp}>{msg.username} : {msg.text}</li>)}
        </ul>
      </div>
{/* when the button is clicked or you hit enter in the input box,
the form calls "sendMessage" with the value and the Submit event */}
      <form onSubmit={(event)=>this.sendMessage(this.inp.value,event)}>

        <input onChange={this.somebodyIsWriting} ref={r => this.inp = r} placeholder="Enter a message" />
        <button>Send</button>
      </form>
      <button onClick={() => this.props.chooseChat(1)}>Chat 1</button>
      <button onClick={() => this.props.chooseChat(2)}>Chat 2</button>

      <div><button onClick={this.clearChatbox}>Clear Chatbox</button>
      </div>
    </div>
    {/* this is the sidebar with active members in the chatroom */}
    <div className="inner-box">
      <div className="chat-members">
        <h3>Chatroom {this.props.chatroom}</h3>
        <ul>
          {this.state.members.map((name) => <li>{name}</li>)}
          {this.state.isWriting ? <div>{this.state.isWriting}</div> : <div></div>}

        </ul>
      </div>
    </div>
  </div>

  );
}
}

export default Chatbox;
