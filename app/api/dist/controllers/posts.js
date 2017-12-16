'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const Post = require('../models/Post');
const Boom = require('boom');
const { draftToMarkdown } = require('markdown-draft-js');

// PUT

exports.updatePost = (req, reply) => {
	const updatedPost = req.payload;

	const query = {
		id: updatedPost.id
	};

	Post.findOneAndUpdate(query, updatedPost, { upsert: true }, (err, post) => {
		if (err) {
			console.log(err);
			return reply(Boom.internal('Internal MongoDB error', err));
		} else {
			return reply(post);
		}
	});
};

// GET

exports.getPosts = (req, reply) => {
	const user = req.auth.credentials;
	Post.find({ user: { $eq: user.id } }).exec((error, posts) => {
		if (error) {
			reply(Boom.internal('Internal MongoDB error', error));
		}
		reply(posts);
	});
};

exports.getSinglePost = (req, reply) => {
	const user = req.auth.credentials;

	Post.findOne({ id: req.params.id }, (err, post) => {
		if (err) {
			reply(Boom.internal('Internal MongoDB error', error));
		}
		reply(post);
	});
};

exports.getMarkdown = (req, reply) => {
	Post.findOne({ id: req.params.id }, (err, post) => {
		if (err) {
			return reply(Boom.internal('Internal MongoDB error', err));
		} else if (!post.public) {
			return reply(Boom.notFound('This post is either not public or I couldn\'t even find it. Things are hard sometimes.'));
		} else {
			return reply({
				content: draftToMarkdown(post.content),
				title: post.title,
				dateAdded: post.dateAdded
			});
		}
	});
};

// POST

exports.createPost = (req, reply) => {
	const post = new Post(_extends({}, req.payload));

	post.save((error, post) => {
		if (error) {
			return reply(Boom.wrap(error, 'Internal MongoDB error'));
		}

		reply(post);
	});
};

// DELETE
exports.deletePost = (req, reply) => {
	Post.findOneAndRemove({ id: req.params.id }, (err, post) => {
		if (err) {
			return reply(Boom.wrap(error, 'Internal MongoDB error'));
		}
		reply(`${post.title} was removed`);
	});
};