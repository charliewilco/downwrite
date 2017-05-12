import React from 'react'
import { connect } from 'react-redux'
import Editor from './components/Editor'
import Input from './components/Input'
import Wrapper from './components/Wrapper'
import { fetchPost } from './actions'

const Loading = () => (
  <div>
    <h1>Loading</h1>
  </div>
)


class Edit extends React.Component {

  componentWillMount () {
    this.props.fetchPost(this.props.match.params.id)
  }

  render () {
    console.log(this.props)
    return (
      this.props.posts.length > 0 ? <Loading /> : (
        <Wrapper>
          <Input value={this.props.posts[0].title} style={{ marginBottom: 16 }} />
        </Wrapper>
      )
    )
  }
}

/*
  <Editor editorState={this.props.post.body} />
  <Editor
    editorState={this.props.post.body}
    onChange={post.body => dispatch(updatePost(post.body))}
  />
*/

function mapStateToProps (state, ownProps) {
  const newCurrentPost = ownProps.match.params.id
  function findPost (id, limit = newCurrentPost) {
    return id === limit
  }

  const post = state.posts.find(findPost)

  console.log(ownProps, newCurrentPost, state.posts[0], post)
  return {
    posts: state.posts,
    ...ownProps
  }
}

export default connect(mapStateToProps, { fetchPost })(Edit)
