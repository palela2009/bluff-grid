import mongoose from 'mongoose';

const gridSchema = new mongoose.Schema({
  title: { type: String, required: true },
  statements: { 
    type: [String], 
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 5;
      },
      message: 'Must have exactly 5 statements'
    }
  },
  trueStatementIndex: { type: Number, required: true, min: 0, max: 4 },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  firebaseId: {
    type: String,
    required: true,
    unique: true,
  },
  email: { type: String },
  grids: { type: [gridSchema], default: [] }
});

const User = mongoose.model('User', userSchema);

export default User;