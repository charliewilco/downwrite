module.exports = {
	webpack: (config, { dev }) => {
		config.module.rules.push({
			test: /\.css$/,
			loader: ['style-loader', 'css-loader', 'postcss-loader']
		})
		return config
	}
}
