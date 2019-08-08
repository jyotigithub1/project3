import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Col, Row, Container } from "../components/Grid";
import Jumbotron from "../components/Jumbotron";
import API from "../utils/API"

class UserHome extends Component {
    state = {
        users: [],
        redirectTo: null
    };

    componentDidMount() {
        API.checkAuth()
            .then(response => {
                // this runs if the user is logged in
                console.log("response: ", response)
            })
            .catch(err => {
                // this runs if the uer is NOT logged in
                this.setState({ redirectTo: "/" })
            })
        this.loadUsers();
    }

    loadUsers() {
        API.getUsers()
            .then(res => {
                console.log(res.data)
                this.setState({
                    users: res.data,
                })
                // console.log(res.data)
            })
            .catch(err => console.log(err));
    }

    render() {
        if (this.state.redirectTo) {
            return <Redirect to={this.state.redirectTo} />
        }
        return (
            <Container fluid>
                <Row>
                    <Col size="lg-5 md-12 sm-12">
                        <Jumbotron addClass="userData" jumboHeight="80%">
                            {/* User image goes here */}
                            <img alt={""} src={"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAMAAACahl6sAAAAM1BMVEXd3d2IiIizs7OdnZ29vb3IyMjS0tLY2NiNjY2oqKjNzc2YmJiTk5Ojo6O4uLjCwsKurq4vFVI5AAADE0lEQVR4nO3X2ZqjIBCAUREVXJP3f9oOSLG49BdjpufmPzfj2KSgoAStKgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAf2IWrZQaaxPvPGarlG6yNq6JndtrgbvnqMo4u8DGNZn67rORl4ZXbM8+wp0+3BglNTOGO/2VwI2SOMNZ4Nh3cxbkgzxe1g6f8f9jaDPGO88P8nhNuTkO3KW+H79Eeo/2PWkfUvvofnX0lCaqyZq8XQTGNx99eFUfB+5Tk+luHp1UzCzD7MPa9zH8tDbxBfZ2cTVhvGaSOLvAXWjii+JucT1cMCNR3dNsw0J3UmyDNHFjs8WvW8ddGHcx5H96SgX5jKqjwIs0canNdxPRevIVVYVEOunXF10TRpKaFLU1S5n0uzqvtba+otoQcB+4l6Jrv1Fbogvz3sZpl37qOF9TWLTIPwhTGOzJnDZh3veBXUJL7PtbidRh3pc4/5LALBOXeo58ZS5+W7OmOqTDz/eBbZwXKbYvGOQRqYv+dDaS/CpyWdpFbZcqWSTHfWBVJHLxtD3Lw8qOdDERI0fByQkjm9cfJeLzWM/bi4msxRXPvMM8+iLcv0wky+NyIuvOdVLhWR5/kUiex+aZlKMyJbI7uNrzBcnzOAhcPuz3XxzT8yHjsnHY5fZ7OHHj6SOSno/jwHETlKPmm3nE82Qd4aNKB0Fl4p8ydXjY95VR5nEQuJcJeKj0gvoxM6nyDWoK3Xey3vHCjWx7APvJtEfFNZR5HASO8Xp18QvhSHgDXblH1r0k2bbqxljT7mrsqtYe7L5udNqPeXuw+7fcENfH2QX2K9yb6rdj6G2dyrWbO2v07Mtie3w/1x3L/1N+UjRF4G1XbZrElb6ZR/axE+OnIchypw43e1YbWvmFKZMci8DVYeD45ans7ReUsr+wAuG0TjtRSNdu8kjj98diXlymiBu2pF1gs353qen+i1ZdCHu5WWat6zx493orn5ftVj+436wVtbhLk/+gIAPfBW6fWvfNyfsmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAv/ACRgBPPolrgQwAAAABJRU5ErkJggg=="} />
                            <div>
                                <strong>Name:</strong> {""}
                            </div>
                            <div>
                                <strong>Wins:</strong> {""}
                            </div>
                            <div>
                                <strong>Losses:</strong> {""}
                            </div>
                            <div>
                                <strong>Ranking:</strong> {""}
                            </div>
                        </Jumbotron>
                    </Col>
                    <Col size="lg-7 md-12 sm-12">
                        <Jumbotron jumboHeight="80%">
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
                                        this.state.users.map((user, index) => {
                                            return (
                                                <tr>
                                                    <td>{index + 1}</td>
                                                    <td>{user.name}</td>
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

export default UserHome;
