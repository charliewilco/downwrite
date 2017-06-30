import React from 'react'
import { css } from 'glamor'
import { Editor, Raw, Plain } from 'slate'
import Button from './components/Button'
import Input from './components/Input'
import Loading from './components/Loading'
import Wrapper from './components/Wrapper'

let inputStyle = css({
  marginBottom: 16
})

class Edit extends React.Component {
  state = {
    post: {}
  }

  componentWillMount () {
    fetch(`/posts/${this.props.match.params.id}`)
      .then(res => res.json())
      .then(data => this.setState({ post: data }))
  }

  onChange = () => console.log('...okay')

  updateTitle = e => this.setState({
    post: {
      ...this.state.post,
      title: e.target.value
    }
  })

  updatePost = () => console.log(this.state)

  render () {
    const { post } = this.state
    console.log(post)
    return (
      !post
      ? <Loading />
      : (
        <Wrapper paddingTop={16}>
          <Input value={post.title} onChange={this.updateTitle} {...inputStyle} />
          <Button positioned onClick={this.updatePost}>Update</Button>
          <Editor state={Raw.deserialize(post.content)} onKeyDown={this.onKeyDown} onChange={this.onChange} />
        </Wrapper>
      )
    )
  }
}

export default Edit
