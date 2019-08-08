// import CategoryGame from '../components/CategoryGame';
import GameContainer from '../pages/GameContainer';
import SocketContext from '../pages/socket-context';
import React, { Component } from "react";
// added by jyoti for scoket.io
import openSocket from 'socket.io-client';
const socket = openSocket("http://localhost:3001:/cat");
class CategoryContainer extends Component {

  state = {
    socketid: "",
    userStatus: ""
  };
  componentDidMount() {

    this.socketSession();
    console.log("Hello");
    console.log("Socket ::::::", socket);
    let id = GameContainer.socketid;
    console.log(id);
    if (id) {
      this.setState({
        socketid: id
      });

    }
  }

  socketSession() {
    return (
      <SocketContext.Consumer> {() =>
        this.setState({
          socketid: { socketid }
        }) </SocketContext.Consumer>

        }
      )
}

seekGame(e, socketid) {
          e.preventDefault();
        console.log(e.target.getAttribute("id"));
        console.log(socketid);
      }
      
render() {
  return (
      
    <div className="card">
          <div className="category" id="Animal">
            <button value={"Animal"} onClick={() => this.seekGame(this.state.socketid)}>
              Category
                 </button>

          </div >
        </div >
        )
      }
            
            
            
            
            }
      export default CategoryContainer;
