const mongoose = require('mongoose');
const User = require('./models/User');
const Bark = require('./models/bark');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/Barker', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const users = [
  { username: 'user1', email: 'user1@example.com', password: 'password1' },
  { username: 'user2', email: 'user2@example.com', password: 'password2' },
  { username: 'user3', email: 'user3@example.com', password: 'password3' }
];

const barks = [
  { content: "Bark 1", user: null },
  { content: "Bark 2", user: null },
  { content: "Bark 3", user: null }
];

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

const seed = async () => {
  try {
    await User.deleteMany({});
    await Bark.deleteMany({});

    const createdUsers = [];
    for (const user of users) {
      const hashedPassword = await hashPassword(user.password);
      const newUser = await User.create({ ...user, password: hashedPassword });
      createdUsers.push(newUser);
    }

    let barkIndex = 0;
    for (const user of createdUsers) {
      barks[barkIndex].user = user._id;
      const newBark = await Bark.create(barks[barkIndex]);
      user.barks.push(newBark._id);
      await user.save();
      barkIndex++;
    }

    console.log('Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed();
