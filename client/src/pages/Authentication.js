import React, { Component } from "react";
// import { Link } from "react-router-dom";
import { Col, Row, Container } from "../components/Grid";
import Jumbotron from "../components/Jumbotron";
import axios from 'axios';
import API from "../utils/API.js";

class Authentication extends Component {
    state = {
        email: 'test@test.com',
        password: 'test',
        welcomeEmail: "",
        googleSigninUrl: ""
    }

    handleInput = event => {
        const { name, value } = event.target
        this.setState({
            [name]: value
        })
    }

    // let's try and login

    handleFormSubmit = event => {
        event.preventDefault()
        const { email, password } = this.state
        axios.post("/login", { email, password })
            .then(result => {
                console.log(result.data)
                this.loadProfileInfo()
                window.location.href = "/home";
            })
    }

    handleFormRegister = event => {
        event.preventDefault()
        const { email, password } = this.state
        axios.post("/register", { email, password })
            .then(result => {
                console.log(result.data)
                this.loadProfileInfo()
                window.location.href = "/home";
            })
    }

    handleFormLogout = event => {
        event.preventDefault()
        API.logout().then(result => {
                console.log(result.data)
                this.setState({ welcomeEmail: "" })
            })
    }

    loadProfileInfo = () => {
        axios.get('/user/me')
            .then(response => {
                this.setState({ welcomeEmail: response.data.email })
            })
            .catch(err => {
                axios.get("/api/google/url").then(response => {
                    this.setState({ googleSigninUrl: response.data.url })
                })
            })
    }

    componentDidMount() {
        // Mostly just for developing locally
        if (window.location.pathname === "/api/google/callback") {
            const searchParams = new URLSearchParams(window.location.search);
            axios.post("/api/google/code", { code: searchParams.get('code') }).then(() => {
                window.location.href = "/"
            })
        } else {
            this.loadProfileInfo()
        }
    }
    render() {
        return (
            <Container fluid>
                <Row>
                    <Col size="lg-5 md-12 sm-12">
                        <Jumbotron jumboHeight="80%">
                            <Row>
                                <Col size="6">
                                    {/* <!-- Button trigger modal --> */}
                                    <button type="button" class="btn btn-dark" data-toggle="modal" data-target="#loginModal">
                                        Login
                                    </button>
                                    {/* <!-- Modal --> */}
                                    <div className="modal fade" id="loginModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                                        <div className="modal-dialog modal-dialog-centered" role="document">
                                            <div className="modal-content">
                                                <div className="modal-header">
                                                    <h5 className="modal-title" id="exampleModalCenterTitle">{this.state.welcomeEmail.length > 0
                                                        ? "Welcome " + this.state.welcomeEmail
                                                        : "Login"}</h5>
                                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div className="modal-body">
                                                    {
                                                        this.state.googleSigninUrl.length > 0 && this.state.welcomeEmail.length === 0
                                                            ? (<h3>Sign in with <a href={this.state.googleSigninUrl} >google </a></h3>)
                                                            : ""
                                                    }
                                                    <form>
                                                        <div className="form-group">
                                                            <input onChange={this.handleInput} name="email" value={this.state.email} type="email" className="form-control" id="loginEmail" aria-describedby="emailHelp" placeholder="Enter email"></input>
                                                        </div>
                                                        <div className="form-group">
                                                            <input onChange={this.handleInput} name="password" value={this.state.password} type="password" className="form-control" id="loginPassword" placeholder="Password"></input>
                                                        </div>

                                                        <button type="submit" className="btn btn-dark" onClick={this.handleFormSubmit}>Submit</button>
                                                    </form>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </Col>
                                <Col size="6">
                                    {/* <!-- Button trigger modal --> */}
                                    <button type="button" className="btn btn-dark" data-toggle="modal" data-target="#registerModal">
                                        Register
                                    </button>

                                    {/* <!-- Modal --> */}
                                    <div className="modal fade" id="registerModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                                        <div className="modal-dialog modal-dialog-centered" role="document">
                                            <div className="modal-content">
                                                <div className="modal-header">
                                                    <h5 className="modal-title" id="exampleModalCenterTitle">Register</h5>
                                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div className="modal-body">
                                                    <form>
                                                        <div className="form-group">
                                                            <input onChange={this.handleInput} name="email" value={this.state.email} type="email" className="form-control" id="registerEmail" aria-describedby="emailHelp" placeholder="Enter email"></input>
                                                        </div>
                                                        <div className="form-group">
                                                            <input onChange={this.handleInput} name="password" value={this.state.password} type="password" className="form-control" id="registerPassword" placeholder="Password"></input>
                                                        </div>

                                                        <button type="submit" className="btn btn-dark" onClick={this.handleFormRegister}>Submit</button>
                                                    </form>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                        </Jumbotron>
                    </Col>
                    <Col size="lg-7 md-12 sm-12">
                        <Jumbotron jumboHeight="80%">
                            <h4>LEADER BOARD</h4>
                            <table class="table">
                                <thead class="thead-dark">
                                    <tr>
                                        <th scope="col">Ranking</th>
                                        <th scope="col">Name</th>
                                        <th scope="col">Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">1</th>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th scope="row">2</th>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th scope="row">3</th>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th scope="row">4</th>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th scope="row">5</th>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </Jumbotron>
                    </Col>
                </Row>
            </Container>

        )
    }
}

export default Authentication;
