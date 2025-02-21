import React, { Component } from "react";
import './Pages.css';
import API from "../utils/API";
import SPGameCard from "../components/SPGameCard";
import SPGameContainer from './SPGameContainer';


let addCategory = [];

class SingleCategory extends Component {
    state = {
        category: [],
        id: ""
    };

    componentDidMount() {
        API.getGames().then(res => {
            // console.log(res.data[0].category);
            this.getAllGames(res.data);
        });
    }

    loadPage = (id) => {
        console.log(id);
        this.setState({
            id: id
        })
    };

    getAllGames(data) {
        for (let i = 0; i < data.length; i++) {
            addCategory.push(data[i]);
        }
        this.setState({
            category: addCategory
        }, () => {
            addCategory = [];
            console.log("State category", this.state.category);
        });
    }

    render() {
        return (
            <div>
                {this.state.id === "" ? (
                    <div className="scatContain">
                        {this.state.category.map(category => (
                            <SPGameCard
                                id={category._id}
                                key={category._id}
                                category={category.category}
                                image={category.image}
                                loadPage={this.loadPage}
                            />
                        ))}

                    </div>
                ) : (

                        <SPGameContainer id={this.state.id} />
                    )}


            </div>
        )

    };

}


export default SingleCategory;
