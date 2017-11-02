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
};
firebase.initializeApp(config);
const database = firebase.database();

class Chatstats extends Component(){
    constructor(){

    }
    render(){
        <div className="inner-box sidebar">

        </div>
    }
}