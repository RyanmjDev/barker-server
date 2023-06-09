const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const User = require('./models/User'); 


const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const server = require('http').createServer(app);
const { socketHandler } = require('./handlers/socketHandler');

//Routes
const barkRoutes = require('./routes/barkRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const socketConfig = require('./socketConfig');

require('./config/passport')(passport);




const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY, 
};


const io = socketConfig.init(server);


io.on('connection', (socket) => {
  socketHandler(io, socket);
});




const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());


passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);



mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

  


app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // Set this to 'true' when using HTTPS
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
    }),
  })
);



 

app.use(passport.initialize());
app.use(passport.session());



//Routes
app.use('/api/barks', barkRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

const port = process.env.PORT || 3000;
//app.listen(port, () => console.log(`Server running on port ${port}`));




server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

