// @flow
import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import { Link } from 'react-router-dom'
import { css, keyframes } from 'glamor'
import { Block, Flex, Column } from 'glamor/jsxstyle'
import User from './User'
import Fetch from './CollectionFetch'
import { SidebarEmpty } from './EmptyPosts'
import SidebarPosts from './SideBarPosts'

const navButton = css({
  display: 'block',
  color: '#757575',
  '& + &': {
    marginBottom: 8
  },
  '&:hover': {
    color: 'var(--color-2)'
  }
})

const navItem = css({
  fontSize: 16,
  paddingTop: 4,
  paddingBottom: 4
})

const fadeInFromLeft = keyframes({
  '0%': { transform: 'translate(25%, 0)', opacity: 0 },
  '100%': { transform: 'translate(0, 0)', opacity: 1 }
})

const addListeners = (el, s, fn) =>
  s.split(' ').forEach(e => el.addEventListener(e, fn, false))
const rmListeners = (el, s, fn) =>
  s.split(' ').forEach(e => el.removeEventListener(e, fn, false))

const SignoutIcon = () => (
  <svg width="13" height="12" viewBox="0 0 13 12">
    <title>Signout Icon</title>
    <g id="Canvas" transform="translate(-1806 -2684)">
      <g id="Signout Icon">
        <use xlinkHref="#signout" transform="matrix(-1 0 0 1 1818.5 2684)" fill="#757575" />
      </g>
    </g>
    <defs>
      <path
        id="signout"
        fillRule="evenodd"
        d="M 8.55579 5.81383e-05C 8.39355 -0.00335983 8.22351 0.144345 8.22363 0.33331C 8.22375 0.521298 8.36951 0.670957 8.55579 0.666806L 11.8433 0.666806L 11.8433 11.3333L 8.55579 11.3333C 8.38232 11.3309 8.22363 11.4905 8.22363 11.6668C 8.22363 11.8428 8.38232 12.0025 8.55579 12.0001L 12.1716 12.0001C 12.3435 12.0001 12.4999 11.8411 12.5 11.6668L 12.5 0.333554C 12.4999 0.158994 12.3435 5.81383e-05 12.1716 5.81383e-05L 8.55579 5.81383e-05ZM 0.0927734 5.77081C 0.0460205 5.82037 0 5.92291 0 6.00006C 0.00134277 6.07818 0.0153809 6.15216 0.0927734 6.22906L 2.72424 9.06256C 2.84521 9.19317 3.05969 9.20465 3.18945 9.0755C 3.31226 8.95318 3.32068 8.73102 3.20227 8.60406L 1.08984 6.33331L 9.86841 6.33331C 10.05 6.33331 10.1973 6.1839 10.1973 5.99981C 10.1973 5.81573 10.05 5.66656 9.86841 5.66656L 1.08984 5.66656L 3.20227 3.39581C 3.32068 3.26886 3.3175 3.04107 3.18945 2.92437C 3.13293 2.87286 3.06775 2.84405 3.00195 2.83575C 2.901 2.8233 2.79871 2.85943 2.72424 2.93731L 0.0927734 5.77081Z"
      />
    </defs>
  </svg>
)

// TODO: Slide to close navigation?

export default class extends Component {
  static displayName = 'Nav'

  componentWillMount() {
    addListeners(document, 'touchstart click', this.outsideHandleClick)

    if (document.body && !this.props.matches) {
      document.body.classList.add('__noScroll')
    }
  }

  componentWillUnmount() {
    rmListeners(document, 'touchstart click', this.outsideHandleClick)

    if (document.body && !this.props.matches) {
      document.body.classList.remove('__noScroll')
    }
  }

  outsideHandleClick = e => {
    if (!findDOMNode(this).contains(e.target)) {
      return this.props.closeNav()
    }
  }

  render() {
    const { matches, token, username } = this.props
    return (
      <Flex
        animation={`${fadeInFromLeft} .45s`}
        component="nav"
        boxShadow={!matches && '0 0 2px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.12)'}
        width={matches ? 384 : '75%'}
        backgroundColor="white"
        position={!matches && 'fixed'}
        right={!matches && 0}
        top={!matches && 0}
        bottom={!matches && 0}
        height={matches ? 'calc(100vh - 4px)' : '100vh'}
        float={matches && 'right'}>
        <Column flex={1} justifyContent={matches && 'space-between'}>
          <Block>
            <User username={username} />
            <Block paddingLeft={8} paddingRight={8} paddingTop={16} paddingBottom={16}>
              <Link to="/" className={css(navButton, navItem)}>
                All Entries
              </Link>

              <Link to="/new" className={css(navButton, navItem)}>
                Create New Entry
              </Link>
            </Block>
          </Block>

          <Block flex={matches && 1} padding={8}>
            <Fetch token={token}>
              {posts =>
                posts.length > 0 ? (
                  <SidebarPosts matches={matches} posts={posts} />
                ) : (
                  <SidebarEmpty />
                )
              }
            </Fetch>
          </Block>

          <Block borderTop="1px solid #DBDCDD" padding={8} textAlign="right">
            <Link to="/signout" className={css(navButton, { fontSize: 14 })}>
              <SignoutIcon /> <span>Sign Out</span>
            </Link>
          </Block>
        </Column>
      </Flex>
    )
  }
}
