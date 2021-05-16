const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('60a0903b33ec1207dca15676')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect('mongodb+srv://new-user_Dallin-Swarts:p9lB95Q7T1krxbr7@cluster-swartsd.h5gty.mongodb.net/shop?retryWrites=true&w=majority').
  then(result => {
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'Dallin',
          email: 'dallin@test.com',
          cart: {
            items: []
          }
        });
        user.save();
      }
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Our app is running on port ${PORT}`);
    });

  }).
  catch(err => {
    console.log(err);
  });