import React from 'react'
import { connect } from 'react-redux'

const MainView = ({ posts }) => {
  console.log(posts)
  return (
    <div className='App'>
      <h1>Posts</h1>
      <ul>
        {posts.map((p, i) => (<li key={i}>{p}</li>))}
      </ul>
    </div>
  )
}

const mapStateToProps = (state) => {
  return { posts: state.posts }
}

export default connect(mapStateToProps)(MainView)
