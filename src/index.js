require("dotenv").config();
const { ApolloServer } = require("apollo-server");
const mongoose = require("mongoose");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const models = require("./models");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
mongoose.connect("mongodb://localhost:27017/graphql-blog", {});

const getUserFromToken = (token) => {
	try {
		if (token) {
			return jwt.verify(token, JWT_SECRET);
		}
		return null;
	} catch (err) {
		return null;
	}
};

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: ({ req }) => {
		const token = req.headers.authorization || "";
		const user = getUserFromToken(token.replace("Bearer ", ""));
		return { models, user };
	},
});

server.listen().then(({ url }) => {
	console.log(`✈️  server ready at ${url}`);
});
