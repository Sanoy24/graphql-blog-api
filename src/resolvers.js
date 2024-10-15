// const { models } = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("apollo-server");

const JWT_SECRET = process.env.JWT_SECRET;

const resolvers = {
	Query: {
		getPosts: async (parent, args, { models }) => {
			return models.Post.find();
		},
		getPost: async (parent, { id }, { models }) => {
			return models.Post.findById(id);
		},
		getUsers: async (parent, args, { models }) => {
			return models.User.find();
		},
		getUser: async (parent, { id }, { models }) => {
			return models.User.findById(id);
		},
	},

	Mutation: {
		// Signup resolver
		createUser: async (parent, { username, email, password }, { models }) => {
			const existingUser = await models.User.findOne({ email });
			if (existingUser) {
				throw new AuthenticationError("User already exists with this email");
			}
			const user = new models.User({ username, email, password });
			user.save();

			const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d" });

			return {
				token,
				user,
			};
		},
		login: async (parent, { email, password }, { models }) => {
			const user = await models.User.findOne({ email });
			if (!user) {
				throw new AuthenticationError("Invalid email or Password.");
			}

			const valid = bcrypt.compare(password, user.password);
			if (!valid) {
				throw new AuthenticationError("Invalid email or password");
			}

			const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d" });
			return {
				token,
				user,
			};
		},
		createPost: async (parent, { title, content }, { models, user }) => {
			if (!user) {
				throw new AuthenticationError("You must login to create new post");
			}
			const post = new models.Post({ title, content, author: user.userId });
			return post.save();
		},
		createComment: async (parent, { content, postID }, { models, user }) => {
			if (!user) {
				throw new AuthenticationError("You must be logged in to comment");
			}
			const comment = new models.Comment({ content, post: postID, author: user.userId });
			return comment.save();
		},
	},
	User: {
		posts: async (user, args, { models }) => {
			return models.Post.find({ author: user.id });
		},
		comments: async (user, args, { models }) => {
			return models.Comment.find({ author: user.id });
		},
	},
	Post: {
		author: async (post, args, { models }) => {
			return models.User.findById(post.author);
		},
		comments: async (post, args, { models }) => {
			return models.Comment.find({ post: post.id });
		},
	},
	Comment: {
		author: async (comment, args, { models }) => {
			return models.User.findById(comment.author);
		},
		post: async (comment, args, { models }) => {
			return models.Post.findById(comment.post);
		},
	},
};

module.exports = resolvers;
