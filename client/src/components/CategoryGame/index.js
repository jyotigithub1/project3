import React from "react";

const CategoryGame = props => {
      return (
            <div className="card">
                  <div className="category" id="Animal">
                        <button value={"Animal"} onClick={() => props.seekGame(props.socketid)}>
                              Category
                             </button>

                  </div >
            </div >
      )
}
export default CategoryGame;

