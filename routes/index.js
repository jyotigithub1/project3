const path = require("path");
const router = require("express").Router();
const apiRoutes = require("./api");
const db = require("../models")
const passport = require("../config/passport")
// API Routes
router.use("/api", apiRoutes);

router.post("/register",(req,res)=>{
  db.User.create({email:req.body.email,password:req.body.password}).then((newUser)=>{
    res.json(newUser)
  })
})
router.post('/login', passport.authenticate("local"),  (req, res) => {
  res.json(req.user)
})
router.get('/logout', (req, res) => {
  console.log("logged out user")
  req.logout();
  res.sendStatus(200);
});

router.get('/user/me', function(req, res){
  if(req.user){
      res.json({
          email: req.user.email
      })
  } else {
      res.status(401).json({})
  }
})
// If no API routes are hit, send the React app
router.use(function(req, res) {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

module.exports = router;
