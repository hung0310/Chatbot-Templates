const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = [
  // CommonJS build
  {
    entry: './src/ChatbotTemplates.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'main.js',
      library: {
        type: 'commonjs2',
      },
      publicPath: '',
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
        {
          test: /\.scss$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[name]__[local]--[hash:base64:5]',
                },
              },
            },
            'sass-loader',
          ],
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          type: 'asset/inline', // Nhúng hình ảnh dưới dạng base64
        },
      ],
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/assets/animations',
            to: 'assets/animations',
          },
        ],
      }),
    ],
    externals: {
      react: 'react',
      'react-dom': 'react-dom',
    },
    mode: 'production',
  },
  // ES Module build
  {
    entry: './src/ChatbotTemplates.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'main.esm.js',
      library: {
        type: 'module',
      },
      publicPath: '',
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
        {
          test: /\.scss$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[name]__[local]--[hash:base64:5]',
                },
              },
            },
            'sass-loader',
          ],
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          type: 'asset/inline', // Nhúng hình ảnh dưới dạng base64
        },
      ],
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/assets/animations',
            to: 'assets/animations',
          },
        ],
      }),
    ],
    externals: {
      react: 'react',
      'react-dom': 'react-dom',
    },
    mode: 'production',
    experiments: {
      outputModule: true,
    },
  },
];