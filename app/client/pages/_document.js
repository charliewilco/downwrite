import Document, { Head, Main, NextScript } from 'next/document'
import { renderStatic } from 'glamor/server'

export default class MyDocument extends Document {
	static async getInitialProps({ renderPage }) {
		const page = renderPage()
		const styles = renderStatic(() => page.html)
		return { ...page, ...styles }
	}

	constructor(props) {
		super(props)
		const { __NEXT_DATA__, ids } = props
		if (ids) {
			__NEXT_DATA__.ids = this.props.ids
		}
	}

	render() {
		return (
			<html>
				<Head>
					<meta name="description" content="Downwrite is a place to right" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />

					<title>Downwrite</title>
					<style dangerouslySetInnerHTML={{ __html: this.props.css }} />
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</html>
		)
	}
}
