const medium = require('medium-sdk')
const { json } = require('micro')
const mc = require('micro-cors')
const { draftToMarkdown } = require('markdown-draft-js')

var client = new medium.MediumClient({
	clientId: 'd33233800430',
	clientSecret: '32475fd9cfe7c2b0d4cbee0ce7c0767a1abe21a0'
})

var redirectURL = 'https://medium.downwrite.us/'

var url = client.getAuthorizationUrl('secretState', redirectURL, [
	medium.Scope.BASIC_PROFILE,
	medium.Scope.PUBLISH_POST
])

// (Send the user to the authorization URL to obtain an authorization code.)
const cors = mc({ allowMethods: ['POST'] })

module.exports = cors(async (req, res) => {
	const post = await json(req)

	return client.exchangeAuthorizationCode(
		'2f18b4de2cfd1df5aefc56bf10275ca68f571b0c6ef5b23de33356e5ef981b057',
		redirectURL,
		function(err, token) {
			client.getUser(function(err, user) {
				client.createPost(
					{
						userId: user.id,
						title: post.title,
						contentFormat: medium.PostContentFormat.MARKDOWN,
						content: draftToMarkdown(post.content),
						publishStatus: medium.PostPublishStatus.DRAFT
					},
					function(err, post) {
						console.log(token, user, post)
					}
				)
			})
		}
	)
})
