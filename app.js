const path = require('path');

const cors = require('cors') // Place this with other requires (like 'path' and 'express')

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const User = require('./models/user');

//const MONGODB_URI = 'mongodb+srv://new-user_Dallin-Swarts:p9lB95Q7T1krxbr7@cluster-swartsd.h5gty.mongodb.net/shop';



const app = express();

const corsOptions = {
  origin: "https://ecommerce-app-swartsd.herokuapp.com/",
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  family: 4
};

const MONGODB_URL = process.env.MONGODB_URL || "mongodb+srv://new-user_Dallin-Swarts:p9lB95Q7T1krxbr7@cluster-swartsd.h5gty.mongodb.net/shop?retryWrites=true&w=majority";

const store = new MongoDBStore({
  uri: MONGODB_URL,
  collection: 'sessions'
});

const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});



app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500',errorController, get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
});

// mongoose
//   .connect(MONGODB_URI)
//   .then(result => {
//     app.listen(3000);
//   })
//   .catch(err => {
//     console.log(err);
//   });

const PORT = process.env.PORT || 3000;

mongoose.connect(MONGODB_URL, options)
  .then(result => {
    // This should be your user handling code implement following the course videos
    app.listen(PORT);
  })
  .catch(err => {
    console.log(err);
  });
