import React, { Component } from "react";
import API from "../../utils/API.js";

class Nav extends Component {

  handleLogout = () => {
    API.logout().catch(err => console.log(err));
  }

  render() {
    return (
      <nav style={{ backgroundColor: "#62cbc2" }} className="navbar navbar-light" >
        <button style={{ border: "none" }} className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
          <span style={{ borderColor: "black" }} className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
          <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
            <li className="nav-item active">
              <a style={{ fontSize: "25px", fontFamily: "'Warnes', cursive" }} className="nav-link" href="/home">Home <span className="sr-only"></span></a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/play">Play Now</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/" onClick={this.handleLogout}>Logout</a>
            </li>
          </ul>
        </div>
        <a style={{ fontSize: "30px", fontFamily: "'Yatra One', cursive", marginRight: "45%" }} className="navbar-brand" href="/home">TRIVIA WAR</a>

      </nav>


    );
  }
}

export default Nav;
