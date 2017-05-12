import React from 'react'
import { connect } from 'react-redux'
import { fetchPosts } from './actions'
import uuid from 'uuid/v4'
import Card from './components/Card'
import { StyleSheet, css } from 'aphrodite/no-important'
import { Block, Flex } from 'jsxstyle'

const styles = StyleSheet.create({
  item: {
    flex: '1',
    width: '100%',
    maxWidth: '20rem'
  }
})

class MainView extends React.Component {
  componentWillMount () {
    const { dispatch } = this.props

    dispatch(fetchPosts())
  }

  render () {

    return (
      <Block className='App' padding={16}>
        <h1>Posts</h1>
        <Flex component='ul' justifyContent='space-between' flexWrap='wrap' listStyle='none inside'>
          {this.props.posts.map((p) =>
            <li className={css(styles.item)}>
              <Card tag='li' {...p} key={uuid()} />
            </li>
          )}
        </Flex>
      </Block>
    )
  }
}


const mapStateToProps = (state) => {
  return { posts: state.posts }
}

export default connect(mapStateToProps)(MainView)
