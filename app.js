const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config');
const dotenv = require('dotenv').config();
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
const User = require('./models/user');

const user_db = process.env.DB_USER;
const password_db = process.env.DB_PASSWORD;

const url = `mongodb+srv://${user_db}:${password_db}@cluster0.z9aglvc.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0`

const app = express();
const store = new MongoDBStore({
    uri: url,
    collection: 'sessions'
});


console.log(user_db)


app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
}))


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
    .connect(
        url
    )
    .then(result => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: 'mario',
                    email: 'mario@mora.com',
                    cart: {
                        items: []
                    }
                });
                user.save();
            }
        });
        app.listen(config.port, () => {
            console.log(config.message)
        });
    })
    .catch(err => {
        console.log(err);
    });