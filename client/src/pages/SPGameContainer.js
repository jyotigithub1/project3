import React, { Component } from "react";
import API from "../utils/API";
import GameCard from "../components/GameCard";
import thumpsup from "../images/thumpsup.jpg";
import thumpsdown from "../images/thumpsdown.png"
import GameCol from "../components/GameCol";
import { Col, Row, Container } from "../components/Grid";
import Jumbotron from "../components/Jumbotron";
import update from 'immutability-helper';
import { Redirect } from "react-router-dom";
import clicksound from "../sound/352804__josepharaoh99__timer-click-track.wav";
import { UserRefreshClient } from "google-auth-library";

let quizQuestions = [];
let nextIndex = 0;
let newIndex = 0;

class SinglePlayerGameContainer extends Component {

   state = {
      title: "",
      category: "",
      question: "",
      questionCount: 0,
      answers: [],
      correctAnswer: "",
      correct: 0,
      incorrect: 0,
      userSelect: "",
      outcome: false,
      index: 0,
      timer: 15,
      socketArr: "",
      userInfo: {},
      redirectTo: null,
      click: false,
      counter: false,
      play: false,
      pause: true,

   };

   play = () => {
      this.audio = new Audio(clicksound);
      this.setState({ play: true, pause: false })
      this.audio.play();
   }

   pause = () => {
      this.setState({ play: false, pause: true })
      this.audio.pause();
   }


   componentDidMount() {

      setTimeout(() => {
         this.setState({ showLoading: false });
      }, 500);

      this.timerID = setInterval(() => this.decrimentTime(), 1000);

      this.getGame(this.props.id);
      this.getUserPic();

      // console.log(this.state.userInfo);
   }

   getUserPic = () => {
      API.checkAuth()
         .then(response => {
            // this runs if the user is logged in
            // console.log("response: ", response.data)
            this.setState({ userInfo: response.data }, this.loadUsers);
         })
         .catch(err => {
            // this runs if the user is NOT logged in
            this.setState({ redirectTo: "/" })
         })
   }

   stopTimer = () => {
      clearInterval(this.timerID);
   }

   //Getting the game information from the Database based on the game's ID
   //Then updating the state
   getGame(gameId) {
      API.getOneGame(gameId)
         .then(res => {
            //quiz Questions will be held outside the component 
            //so we can go through the questions/answers with an index value
            quizQuestions = res.data;
            this.setQuestionState(res.data);
         });
   }

   shuffleQuestions(array) {
      var currentIndex = array.length;
      var temporaryValue, randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {
         // Pick a remaining element...
         randomIndex = Math.floor(Math.random() * currentIndex);
         currentIndex -= 1;

         // And swap it with the current element.
         temporaryValue = array[currentIndex];
         array[currentIndex] = array[randomIndex];
         array[randomIndex] = temporaryValue;
      }
      return array;
   }

   // Setting the state of the game
   setQuestionState(data) {
      // console.log("DATA " + JSON.stringify(data));
      let index = this.state.index;
      let allAnswers = data.questions[index].answers.answersObject;
      //push correct answer to the array
      allAnswers.push(data.questions[index].correctAnswer);
      //shuffle all questions
      let shuffledArr = this.shuffleQuestions(allAnswers);

      this.setState({
         title: data.title,
         category: data.category,
         question: data.questions[index].question,
         answers: shuffledArr,
         correctAnswer: data.questions[index].correctAnswer,
         questionCount: data.questions.length
      }, () => { this.play() });
   }

   // This function decreases the time limit of the game 
   decrimentTime() {
      if (this.state.timer !== 0) {
         this.setState({
            timer: this.state.timer - 1
         });
      } else {
         this.setState({
            timer: 10
         }, this.setUserAnswer()
         )
      }
   }

   //This method updates the game state basked on what the user clicked.
   handleSelection = id => {
      //Stop timer and audio
      this.stopTimer();
      this.pause();
      // console.log(id);

      //update state with user selection
      this.setState({
         userSelect: id,
         click: true
      }, () => {
         //putting this in a callback so we're sure the state has been updated
         //before setUserAnswer is called
         this.setUserAnswer();
      });
   };

   //This method checks if the user answer is correct and checks if the
   //game continues or not based on if there are any questions left
   setUserAnswer = () => {
      //if the user didn't select an answer add to incorrect
      if (this.state.userSelect === "") {
         // console.log("No answer selected");

         // stop the timer, and add to incorrect state
         let newIncorrect = this.state.incorrect + 1;
         this.stopTimer();
         this.setState({
            incorrect: newIncorrect,
            counter: false,
            click: true,
         }, () => {
            // this.setState({
            //    userInfo: update(this.state.userInfo, {
            //       losses: { $set: newIncorrect }
            //    })
            // })
         }, () => this.handleSelection(this.state.userInfo._id))
      }

      //if the user selected the correct answer, add to correct
      else if (this.state.userSelect === this.state.correctAnswer) {
         // console.log("Correct answer selected");
         this.stopTimer(this.timerID);
         let newCorrect = this.state.correct + 1;
         this.setState({
            correct: newCorrect,
            counter: true,
         }, () => { console.log("Correct Answer", this.state.correct) })

      }

      //if the user selected the incorrect answer, add to incorrect
      else if (this.state.userSelect !== this.state.correctAnswer) {
         // console.log("Incorrect Answer selected");
         let newIncorrect = this.state.incorrect + 1;
         this.stopTimer(this.timerID);
         this.setState({
            incorrect: newIncorrect,
            counter: false,
         }, () => { console.log("incoreect Answer", this.state.incorrect) })

      }
   }

   nextQuestion = () => {
      //This variable is checking to see what the next index value will be
      this.stopTimer();
      this.pause();
      nextIndex = (this.state.index + 1);


      //if the next index value is equal to the total amount of questions then stop the game
      //otherwise, keep going
      if (nextIndex === this.state.questionCount) {
         this.stopTimer();
         this.endGame();
      } else {
         this.setNextQuestion();
      }
   }

   // button for Play again, updates the users scores and returns to the home page.
   // first checking the database, then pulling the userinfo and updating the wins based what is the current wins.
   handlePlayAgainBtn = (user) => {
      this.stopTimer();
      if (this.state.userInfo.id === user.id) {
         if (this.state.correct >= 7) {
            API.addWin(user.id).then(() => this.setState({ redirectTo: "/home" }));
         }

         else {
            API.addLoss(user.id).then(() => this.setState({ redirectTo: "/home" }));
         }
      }
   }



   checkforNextQuestion = () => {
      //start timer and sound
      this.timerID = setInterval(() => this.decrimentTime(), 1000);
      this.play();

      //grab next index
      newIndex = this.state.index + 1;
      if (newIndex !== this.state.questionCount) {
         this.setNextQuestion(newIndex);
      } else {
         this.setState({
            outcome: true
         }, () => { this.pause() })
      }
   }

   setNextQuestion = (newIndex) => {
      let allAnswers = quizQuestions.questions[newIndex].answers.answersObject;
      //push correct answer to the array
      allAnswers.push(quizQuestions.questions[newIndex].correctAnswer);
      //shuffle all questions
      let shuffledArr = this.shuffleQuestions(allAnswers);
      // this.play();
      this.setState({
         index: newIndex,
         timer: 10,
         question: quizQuestions.questions[newIndex].question,
         answers: shuffledArr,
         correctAnswer: quizQuestions.questions[newIndex].correctAnswer,
         userSelect: "",
         click: false
      }, () => {
         // console.log(this.state);
      });
   }

   endGame = () => {
      console.log("GAME OVER");
      this.stopTimer();
      this.pause();
   }



   render() {
      if (this.state.showLoading) {
         return (
            <div className="circlecontainer">
               <div class="lds-circle"><div></div></div>
            </div>
         );
      }

      if (this.state.redirectTo) {
         clearInterval(this.state.timer);
         return <Redirect to={this.state.redirectTo} />
      }

      return (
         <div>
            <Container fluid="-fluid">
               <Row>
                  <Col size="12" id="titleCol">
                     <h5 style={{ color: "white", marginTop: "100px", fontSize: "30px" }} className="text-center"> {this.state.title} </h5>
                  </Col>
               </Row>
               <Row>
                  <GameCol size="12">
                     <Jumbotron jumboWidth="800px" addClass="userData" jumboHeight="80%">

                        {
                           this.state.click && !this.state.outcome
                              ?
                              (
                                 this.state.counter
                                    ?
                                    <div>
                                       <h4>You are Correct!!!</h4>
                                       <button className="btn btn-primary btn-dark" onClick={this.checkforNextQuestion}>Next Question</button>
                                    </div>
                                    :

                                    <div>
                                       <h4> Correct Answer: {this.state.correctAnswer}</h4>
                                       <button className="btn btn-primary btn-dark" onClick={this.checkforNextQuestion}>Next Question </button>
                                    </div>
                              )
                              :
                              (
                                 !this.state.outcome
                                    ? (
                                       <div>
                                          <h2>{this.state.question}</h2>
                                          <h4>Tick Tock <strong>{this.state.timer}s </strong> left</h4>


                                          {this.state.answers.map(answer => (
                                             <GameCard
                                                id={answer}
                                                key={answer}
                                                answer={answer}
                                                correctAnswer={this.state.correctAnswer}
                                                handleSelection={this.handleSelection}

                                             />
                                          ))}
                                       </div>
                                    ) : (
                                       <div>
                                          <h5><strong>{"Game Over"}</strong></h5>
                                          <button className="btn btn-primary btn-dark" onClick={() => this.handlePlayAgainBtn(this.state.userInfo)}>Play Again</button>
                                       </div>
                                    )
                              )
                        }
                     </Jumbotron>
                  </GameCol>
               </Row>

               <Row>

                  <Col size="6" id="player1">
                     <img style={{ marginTop: "50px", width: "100px", height: "100px", backgroundColor: "white", borderRadius: "50%" }} alt={"player1"} src={thumpsup} />
                     <h5 style={{ color: "white" }}>Correct  {this.state.correct}</h5>
                  </Col>
                  <Col size="6" id="player2">
                     <img style={{ marginTop: "50px", width: "100px", height: "100px", backgroundColor: "white", borderRadius: "50%" }} alt={"player1"} src={thumpsdown} />
                     <h5 style={{ color: "white" }}>Incorrect {this.state.incorrect}</h5>
                  </Col>
                  <Col size="3"></Col>
               </Row>
            </Container>
         </div>
      )
   }

}

export default SinglePlayerGameContainer