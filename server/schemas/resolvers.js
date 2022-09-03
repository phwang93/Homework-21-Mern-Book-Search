const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.data) {
        return User.findOne({ _id: context.data._id }).populate("savedBooks");
      }
      throw new AuthenticationError("You have to be logged in in order to save books!");
    },
  },

  Mutation: {
    //Create user
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      if (!user) {
        return res.status(400).json({ message: "Something went wrong. Please try again!" });
      }
      const token = signToken(user);

      return { token, user };
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Unable to locate a user with this email address!");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials, please try again.");
      }

      const token = signToken(user);

      return { token, user };
    },

    saveBook: async (parent, { book }, context) => {
      try {

        const savedBooks = await User.findOneAndUpdate(
          { _id: context.data._id },
          { $addToSet: { savedBooks: book } },
          { new: true }
        );
        return savedBooks;
      } catch (err) {
        console.log(err);
        return err;
      }
    },

    removeBook: async (parent, { bookId }, context) => {
      try {
        if (!context.data)
          throw new AuthenticationError("You need to be logged in!");

        const updatedUser = await User.findOneAndUpdate(
          { _id: context.data._id },
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true }
        );
        if (!updatedUser) {
          return { message: "Something went wrong.. please try again." };
        }
        return updatedUser;
      } catch (err) {
        console.log(err);
        return err;
      }
    },
  },
};

module.exports = resolvers;
