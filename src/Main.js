import React from 'react'
import { connect } from 'react-redux'
//
// const Card = (props) => {
//   props.blockMap.map(b => {
//     <b.tag children={} />
//   })
// }

const MainView = ({ posts }) => {
  console.log(posts)
  return (
    <div className='App'>
      <h1>Posts</h1>
      <ul>
        {posts.map((p) => console.log)}
      </ul>
    </div>
  )
}

const mapStateToProps = (state) => {
  return { posts: state.posts }
}

export default connect(mapStateToProps)(MainView)
