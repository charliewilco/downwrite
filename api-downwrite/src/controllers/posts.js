/* eslint-disable no-console */
const Post = require('../models/Post')
const Boom = require('boom')
const { draftToMarkdown } = require('markdown-draft-js')

// PUT

exports.updatePost = (req, reply) => {
  const updatedPost = req.payload
  const query = { id: updatedPost.id }

  Post.findOneAndUpdate(query, updatedPost, { upsert: true }, (err, post) => {
    if (err) {
      console.log(err)
      return reply(Boom.internal('Internal MongoDB error', err))
    } else {
      return reply(post)
    }
  })
}

// GET

exports.getPosts = (req, reply) => {
  const { user } = req.auth.credentials

  Post.find({ user: { $eq: user } }).exec((error, posts) => {
    if (error) {
      reply(Boom.internal('Internal MongoDB error', error))
    }
    reply(posts)
  })
}

exports.getSinglePost = (req, reply) => {
  const user = req.auth.credentials

  Post.findOne({ id: req.params.id }, (err, post) => {
    if (err) {
      reply(Boom.internal('Internal MongoDB error', err))
    }

    if (post.author === user) {
      console.log('Maybe this is true')
    }

    reply(post)
  })
}

exports.getMarkdown = (req, reply) => {
  Post.findOne({ id: req.params.id }, (err, post) => {
    if (err) {
      return reply(Boom.internal('Internal MongoDB error', err))
    } else if (!post.public) {
      return reply(
        Boom.notFound(
          "This post is either not public or I couldn't even find it. Things are hard sometimes."
        )
      )
    } else {
      return reply({
        id: req.params.id,
        content: draftToMarkdown(post.content, {
          entityItems: {
            LINK: {
              open: () => {
                return '['
              },

              close: entity => {
                return `](${entity.data.url || entity.data.href})`
              }
            }
          }
        }),
        title: post.title,
        dateAdded: post.dateAdded
      })
    }
  })
}

// POST

exports.createPost = (req, reply) => {
  const post = new Post({ ...req.payload })

  post.save((error, post) => {
    if (error) {
      return reply(Boom.wrap(error, 'Internal MongoDB error'))
    }

    reply(post)
  })
}

// DELETE
exports.deletePost = (req, reply) => {
  Post.findOneAndRemove({ id: req.params.id }, (err, post) => {
    if (err) {
      return reply(Boom.wrap(err, 'Internal MongoDB error'))
    }
    reply(`${post.title} was removed`)
  })
}
