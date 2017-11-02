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
    this.props.name ? this.name = this.props.name : this.name = `anonymoose${Math.floor(Math.random() * 10000)}`


  }
  componentDidMount() {
    this.enterChatroom(this.props.chatroom);
    console.log(
      "Chatbox component mounted and I added listeners to database chatroom " + this.props.chatroom)
  }

  componentDidUpdate(prevProps) {

    //this fires every time the component is re-rendered by the 
    //App.jsx parent component with a different chatroom
    //selected.
    if (prevProps !== this.props) {
      console.log("props are different, chief. look:")
      console.log(prevProps)
      console.log(this.props)

      console.log("updating with the new props now, eh. Removing and Adding listeners.")
      //first it removes the listeners from the previously selected chatroom
      this.leaveChatroom(prevProps.chatroom)

      //then it empties the messages and members, 
      //then adds the listeners to the new chatroom's path, which will populate the chat
      //with messages and members
      this.enterChatroom(this.props.chatroom)

    }
  }

  enterChatroom = (newChatroom) => {
    this.setState({ messages: [], members: [`You (${this.name})`] },
      () => this.addListeners(newChatroom));
    database.ref(`members/${newChatroom}/${this.name}`).set(true);
    console.log(`hey yu're in ${newChatroom}`);


  }
  //given a chatroom, removes the listeners for that chatroom in the database
  //which saves us from memory leaks from too many listeners.
  //it also tells the database that we've left this chatroom.

  leaveChatroom = (oldChatroom) => {
    this.removeListeners(oldChatroom);
    database.ref(`members/${oldChatroom}/${this.name}`).remove(
      console.log("hey I de-registered you from Chatroom " + oldChatroom))
  }

  //removes listeners
  removeListeners = (chatroom) => {
    database.ref(`messages/${chatroom}`).off();
    database.ref(`chats/${chatroom}`).off();
    database.ref(`members/${chatroom}`).off()
    database.ref(`members/${chatroom}/${this.name}`).off()

  }




  addListeners = (chatroom) => {
    // adds a database listener which retrieves stored messages from the database and 
    //add them to this component, and then continue listening for subsequent
    //added messages. 
    database.ref(`messages/${chatroom}`).on("child_added", (d) =>
      this.setState(st => ({ messages: st.messages.concat(d.val()) })))

    //also adds a database listener for users in this chatroom. 
    //whenever a member is added into the members/${chatroom} path,
    //unless it's the current user,
    //it concats their name (d.key) to this.state.members.
    //if it was switched to false, it removes them from the list.
    database.ref(`members/${chatroom}`).on("child_added", (d) => {
      if (d.key !== this.name) {
        this.setState(st => ({
          members: st.members.concat(d.key),
          messages: st.messages.concat({
            username: "admin",
            timestamp: Date.now(),
            text: `${d.key} joined the chat.`
          })
        }))
      }

    })
    //when somebody is removed from this chatroom's database, this listener filters them from this.state.members
    // also adds a message to this.state.messages saying "hey somebody left", without
    //sending that message thru the database, because if it did that,
    //we'd get as many messages as there are clients with this listener. we only want one.
    //this doesn't work if two people have the same username unfortunately,
    //for example 'anonymoose'.
    database.ref(`members/${chatroom}`).on("child_removed", (d) => {
      console.log(`${d.key} got removed from this chat server-side`)
      this.setState(st => ({
        members: st.members.filter(value => value !== d.key),
        messages: st.messages.concat({
          username: "admin",
          timestamp: Date.now(),
          text: `${d.key} left the chat.`
        })
      }), () => console.log(`${d.key} got removed client-side too.`))
    })


    //Also adds a database listener for changes to the value of "isWriting",
    //which is the username of whoever's writing.
    //When that happens, unless the username is this user's username,
    //it will set this.state.isWriting to that username.
    database.ref(`chats/${chatroom}/isWriting`).on(
      "value",
      (d) => {
        if (d.val() !== this.name) {
          this.setState(st => ({
            isWriting: d.val()
          })
          )
        }
      })
    //finally it clears the value of "isWriting" in this chatroom in the database, so nobody starts off writing.
    //this actually might not be the best representation of what I want
    //because it will erase the writing notification every time one person joins. I commented it out for now.
    // database.ref(`chats/${chatroom}/isWriting`).set(``)

    //will remove me from the registry when I disconnect.
    database.ref(`members/${chatroom}/${this.name}`).onDisconnect().remove()

  }
  //upon form submitting, pushes a new child to the "messages/" path in the database, and sets that child
  //to have three child key-value pairs relating to the message.
  //clears the chatbox and resets the `messages/${this.state.chatNum}/isWriting` value in the database, 
  //because clearing the chatbox isn't enough to trigger the onChange event listener so we need
  // to do it here with that line of code.
  sendMessage = (text, event) => {
    if (event) { event.preventDefault(); }
    database.ref(`messages/${this.props.chatroom}`).push().set({
      timestamp: Date.now(),
      text: text,
      username: this.name
    })
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
        <form onSubmit={(event) => this.sendMessage(this.inp.value, event)}>

          <input onChange={this.somebodyIsWriting} ref={r => this.inp = r} placeholder="Enter a message" />
          <button>Send</button>
        </form>


        <div><button onClick={this.clearChatbox}>Clear Chatbox</button>
        </div>
      </div>
      {/* this is the sidebar with active members in the chatroom */}
      <div className="inner-box">
        <nav>
          <button onClick={() => this.props.chooseChat(1)}>Chat 1</button>
          <button onClick={() => this.props.chooseChat(2)}>Chat 2</button>
        </nav>
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
