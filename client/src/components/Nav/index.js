import React, { Component } from "react";
import API from "../../utils/API.js";
import { Link } from "react-router-dom";

class Nav extends Component {

  handleLogout = () => {
    API.logout().catch(err => console.log(err));
    //TODO Handle Logout for socket.io
  }

  render() {
    return (
      <nav style={{ backgroundColor: "#62cbc2" }} className="navbar navbar-light" >
        <button style={{ border: "none" }} className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
          <span style={{ borderColor: "black" }} className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
          <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
            <li className="nav-item active" data-toggle="collapse" data-target=".navbar-collapse">
              {/* <a style={{fontSize: "25px", fontFamily: "'Warnes', cursive"}} className="nav-link" href="/home">Home <span className="sr-only"></span></a> */}
              <Link to="/home" style={{ fontSize: "25px", fontFamily: "'Warnes', cursive", color: "black", textDecoration: "none" }} className="nav-link">Home</Link>
            </li>
            <li className="nav-item" data-toggle="collapse" data-target=".navbar-collapse">
              {/* <a className="nav-link" href="/play">Play Now</a> */}
              <Link to="/play" style={{ color: "black", textDecoration: "none" }}>Play Now</Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/" onClick={this.handleLogout}>Logout</a>
            </li>
          </ul>
        </div>
        <Link to="/home" style={{ fontSize: "30px", fontFamily: "'Yatra One', cursive", color: "black", textDecoration: "none" }} className="nav-link" >TRIVIA WAR</Link>
        {/* <a style={{fontSize: "30px", fontFamily: "'Yatra One', cursive", marginRight:"45%"}} className="navbar-brand" href="/home">TRIVIA WAR</a> */}
      </nav>
    );
  }
}

export default Nav;
