const path = require('path');

module.exports = {
    entry: './src/App.js',
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        host: 'localhost',
        port: '8080',
        https: true,
        hot: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ["babel-loader"]
            },
            {
                test: /\.(glb|gltf|fbx)$/,
                use:
                [
                    {
                        loader: 'file-loader',
                    }
                ]
            },
            {
                test: /\.glsl$/,
                loader: 'webpack-glsl-loader'
            },
        ]
    }
  };