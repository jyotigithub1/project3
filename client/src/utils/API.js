import axios from "axios";

export default {
  // Gets all books
  getGames: function() {
    console.log("API Get Games");
    return axios.get("/api/game");
  },
  // Gets the book with the given id
  getOneGame: function(id) {
    return axios.get("/api/game/" + id);
  },
  logout: function() {
    return axios.get("/logout");
  },
  checkAuth: function() {
    return axios.get("/user/me");
  },
  getUsers: function() {
    return axios.get("/api/user")
  },
  getOneUser: function(id) {
    return axios.get("/api/user/" + id);
  }
};

