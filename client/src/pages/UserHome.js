import React, { Component } from "react";
import { withRouter, Redirect } from "react-router-dom";
import { Col, Row, Container } from "../components/Grid";
import Jumbotron from "../components/Jumbotron";
import API from "../utils/API"

class UserHome extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            userInfo: {},
            redirectTo: null,
            ranking: ""
        };
    }

    componentDidMount() {
        console.log("USER HOME RENDER");
        //on page load, check to see if the user is in the database
        //then set that user in the state
        API.checkAuth()
            .then(response => {
                // this runs if the user is logged in
                // console.log("User Data: ", response.data)
                console.log("User authenticated");
                this.setState({userInfo:response.data}, this.loadUsers)
            })
            .catch(err => {
                // this runs if the user is NOT logged in
                this.setState({ redirectTo: "/" })
            })
    }

    findRanking = () => {
        let ranking = 0;
        let allUsers = this.state.users;
        // console.log(allUsers);
        for (let i = 0; i < allUsers.length; i++) {
            if(allUsers[i]._id === this.state.userInfo.id){
                ranking = (i + 1);
                // console.log("user Found " + i)
                // console.log(ranking)
                break;
            }
            // console.log(allUsers[i]);
        }
        this.setState({
            ranking: ranking
        })
    }

    loadUsers() {
        API.getUsers()
            .then(res => {
                // console.log("All users",res.data);
                this.setState({
                    users: res.data,
                }, this.findRanking)
                // console.log(res.data)
            })
            .catch(err => console.log(err));
    }

    handlePlayNowBtn = () => {
        let path = "/play";
        this.props.history.push(path);
    }

    render() {
        if (this.state.redirectTo) {
            return <Redirect to={this.state.redirectTo} />
        }
        return (
            <Container fluid>
                <Row>
                    <Col size="lg-5 md-12 sm-12">
                        <Jumbotron addClass="userData" style={{maxWidth:"400px", maxHeight:"500px"}}>
                            {/* User image goes here */}
                            <img style={{width:"200px"}} alt={""} src={this.state.userInfo.picLink} />
                            <div className="name" style={{paddingTop: "25px"}}>
                                <strong>Name: </strong> {this.state.userInfo.name}
                            </div>
                            <div>
                                <strong>Wins:</strong> {this.state.userInfo.wins}
                            </div>
                            <div>
                                <strong>Losses:</strong> {this.state.userInfo.losses}
                            </div>
                            <div className="ranking" style={{paddingBottom: "30px"}}>
                                <strong>Ranking:</strong> {this.state.ranking}
                            </div>
                            <Row className="justify-content-center"style={{paddingTop:"35px !important"}} >
                                <Col size="lg-12 md-12 sm-12">
                                    <button className="btn btn-primary btn-dark"  onClick={() => this.handlePlayNowBtn()}>Play Game</button>
                                </Col>
                            </Row>
                        </Jumbotron>
                    </Col>
                    <Col size="lg-7 md-12 sm-12">
                        <Jumbotron style={{height:"500px"}}>
                            <h4>LEADER BOARD</h4>
                            <table className="table">
                                <thead className="thead-dark">
                                    <tr>
                                        <th scope="col">Ranking</th>
                                        <th scope="col">Name</th>
                                        <th scope="col">Wins</th>
                                        <th scope="col">Losses</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.users.slice(0,5).map((user, index) => {
                                            return (
                                                <tr key={index + 1}>
                                                    <td>{index + 1}</td>
                                                    <td>{user.username}</td>
                                                    <td>{user.totalWins}</td>
                                                    <td>{user.totalLosses}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </Jumbotron>
                    </Col>
                </Row>
            </Container>

        )
    }
}

export default withRouter(UserHome);
