const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (_, args, { user }) => {
      if (user) {
        const userdata = await User.findOne({ _id: user._id });

        return userdata;
      }
      throw new AuthenticationError('You are not logged in...');
    }
  },

  Mutation: {
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },
    addUser: async (_, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (_, { savedBooks }, { user }) => {
      if (user) {
        const updateUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: savedBooks } },
          { new: true, runValidators: true }
        );

        return updateUser;
      }

      throw new AuthenticationError('You are not logged in...');
    },
    removeBook: async (_, { bookId }, { user }) => {
      if (user) {
        const updateUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true, runValidators: true }
        );

        return updateUser;
      }

      throw new AuthenticationError('You are not logged in...');
    }
  },
};

module.exports = resolvers;
