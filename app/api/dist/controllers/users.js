'use strict';

const User = require('../models/User');
const Boom = require('boom');
const hash = require('../util/hash');
const createToken = require('../util/token');
const uuid = require('uuid/v4');

exports.createUser = (req, reply) => {
	const user = new User();

	user.email = req.payload.email;
	user.username = req.payload.username;
	user.admin = false;
	user.id = uuid();

	hash(req.payload.password, (err, hash) => {
		if (err) {
			throw Boom.badRequest(err);
		}

		user.password = hash;

		user.save((err, newUser) => {
			if (err) {
				throw Boom.badRequest(err);
			}

			reply({
				userID: newUser.id,
				id_token: createToken(newUser),
				username: user.username
			}).code(201);
		});
	});
};

exports.authenticateUser = (req, reply) => {
	return reply({
		userID: req.pre.user.id,
		username: req.pre.user.username,
		id_token: createToken(req.pre.user)
	}).code(201);
};