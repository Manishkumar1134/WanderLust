if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
// requires the model with Passport-Local Mongoose plugged in
const User = require("./models/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"; // db name -> wanderlust
const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("DB Connected..");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600, // if nothing happen in webpage then update session after 24hr.
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // days,hour,minute,second,millsec
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// app.get("/", (req, res) => {
//   res.send("Working..");
// });

app.use(session(sessionOptions));
app.use(flash());

/*To use Passport in an Express or Connect-based application, configure it with the 
required passport.initialize() middleware. If your application uses persistent login 
sessions (recommended, but not required), passport.session() middleware must also be used. */
app.use(passport.initialize());
app.use(passport.session());

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

//DemoUser
// app.get("/demouser", async (req, res) => {
//   let fakeuser = new User({
//     email: "manish123@gmail.com",
//     username: "Manish",
//   });
//   /*register(user, password, cb) Convenience method to register a new user
//   instance with a given password. Checks if username is unique. */
//   let registerdUser = await User.register(fakeuser, "hellopass");
//   res.send(registerdUser);
// });

//routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.listen(8080, () => {
  console.log("Running at 8080");
});

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went Wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});
