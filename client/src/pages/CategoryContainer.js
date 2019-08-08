// import CategoryGame from '../components/CategoryGame';
import React, { Component } from "react";
// added by jyoti for scoket.io
import API from "../utils/API.js";



class CategoryContainer extends Component {

  state = {
    socketid: "",
    userStatus: ""
  };

  componentDidMount() {
    // this.socketSession();
    API.checkAuth()
      .then(res => {
        console.log("Hello");
        console.log("Socket ::::::", res.data.socketId);
        this.setState({ socketid: res.data.socketId });
      })
      .catch(err => console.log("THE USER SHOULD BE REDIRECT TO HOME CAUSE THEY'RE NOT LOGGED IN - James"));
  };

  //   socketSession() {
  //     return (
  //       <SocketContext.Consumer> {() =>
  //         this.setState({
  //           socketid: { socketid }
  //         }) </SocketContext.Consumer>

  //         }
  //       )
  // }

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
