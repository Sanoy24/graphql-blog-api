const { gql } = require("apollo-server");

const typeDefs = gql`
	# User types
	type User {
		id: ID!
		username: String!
		email: String!
		posts: [Post]
		comments: [Comment]
	}

	# post type

	type Post {
		id: ID!
		title: String!
		content: String!
		author: User!
		comments: [Comment]
		createdAt: String!
	}

	# comment type
	type Comment {
		id: ID!
		content: String!
		post: Post!
		author: User!
		createdAt: String!
	}

	type Query {
		getPosts: [Post]
		getPost(id: ID!): Post
		getUsers: [User]
		getUser(id: ID!): User
	}
	type AuthPayload {
		token: String!
		user: User!
	}
	# Mutation for modifying data

	type Mutation {
		createUser(username: String!, email: String, password: String!): AuthPayload
		login(email: String, password: String!): AuthPayload
		createPost(title: String!, content: String!, authorId: ID!): Post
		createComment(content: String!, postId: ID!, authorId: ID!): Comment
	}
`;

module.exports = typeDefs;
