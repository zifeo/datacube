const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const GasPlugin = require('gas-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const dotenv = require('dotenv').config();

const parsed = dotenv.error ? {} : dotenv.parsed;
const envVars = parsed || {};
const PORT = envVars.PORT || 3000;
envVars.NODE_ENV = process.env.NODE_ENV;
envVars.PORT = PORT;
const isProd = process.env.NODE_ENV === 'production';

// our destination directory
const context = __dirname;
const destination = path.resolve(context, 'dist');

// define server paths
const serverEntry = './src/server/index.ts';

// define appsscript.json file path
const copyAppscriptEntry = './appsscript.json';

// define live development dialog paths
const devDialogEntry = './dev/index.tsx';

// define client entry points and output names
const clientEntrypoints = [
  {
    name: 'sidebar',
    entry: './src/client/sidebar/index.tsx',
    filename: 'panel',
    template: './src/client/sidebar/index.html',
  },
];

// define certificate locations
// see "npm run setup:https" script in package.json
const keyPath = path.resolve(__dirname, './certs/key.pem');
const certPath = path.resolve(__dirname, './certs/cert.pem');

const copyFilesConfig = {
  name: 'copy appsscript.json',
  mode: 'production', // unnecessary for this config, but removes console warning
  entry: copyAppscriptEntry,
  output: {
    path: destination,
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: copyAppscriptEntry,
          to: destination,
        },
      ],
    }),
  ],
};

const clientConfig = {
  context,
  mode: isProd ? 'production' : 'development',
  output: {
    path: destination,
    // this file will get added to the html template inline
    // and should be put in .claspignore so it is not pushed
    filename: 'main.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  module: {
    rules: [
      // typescript config
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
        },
      },
      // we could add support for scss here
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};

// imported from https://github.com/facebook/create-react-app/blob/main/packages/react-dev-utils/InlineChunkHtmlPlugin.js
// modified to handle the hash appended to the file main.js?459654645
class InlineChunkHtmlPlugin {
  constructor(htmlWebpackPlugin, tests) {
    this.htmlWebpackPlugin = htmlWebpackPlugin;
    this.tests = tests;
  }

  getInlinedTag(publicPath, assets, tag) {
    if (tag.tagName !== 'script' || !(tag.attributes && tag.attributes.src)) {
      return tag;
    }
    const scriptName = publicPath
      ? tag.attributes.src.replace(publicPath, '')
      : tag.attributes.src;
    if (!this.tests.some((test) => scriptName.match(test))) {
      return tag;
    }
    const asset = assets[scriptName.split('?')[0]];
    if (asset == null) {
      return tag;
    }
    return { tagName: 'script', innerHTML: asset.source(), closeTag: true };
  }

  apply(compiler) {
    let publicPath = compiler.options.output.publicPath || '';
    if (publicPath && !publicPath.endsWith('/')) {
      publicPath += '/';
    }

    compiler.hooks.compilation.tap('InlineChunkHtmlPlugin', (compilation) => {
      const tagFunction = (tag) =>
        this.getInlinedTag(publicPath, compilation.assets, tag);

      const hooks = this.htmlWebpackPlugin.getHooks(compilation);
      hooks.alterAssetTagGroups.tap('InlineChunkHtmlPlugin', (assets) => {
        assets.headTags = assets.headTags.map(tagFunction);
        assets.bodyTags = assets.bodyTags.map(tagFunction);
      });
    });
  }
}

const clientConfigs = clientEntrypoints.map((clientEntrypoint) => {
  return {
    ...clientConfig,
    name: clientEntrypoint.name,
    entry: clientEntrypoint.entry,
    plugins: [
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(envVars),
      }),
      new HtmlWebpackPlugin({
        template: clientEntrypoint.template,
        scriptLoading: 'blocking',
        publicPath: 'auto',
        hash: true,
        filename: `${clientEntrypoint.filename}${isProd ? '' : '-impl'}.html`,
        inlineSource: '^[^(//)]+.(js|css).*$', // embed all js and css inline, exclude packages with '//' for dynamic cdn insertion
      }),
      new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [
        new RegExp('^[^(//)]+.(js|css).+$'),
      ]),
    ],
  };
});

const gasWebpackDevServerPath = require.resolve(
  'google-apps-script-webpack-dev-server'
);

const devServer = {
  port: PORT,
  contentBase: destination,
  writeToDisk: true,
  before: (app) => {
    // this '/gas/' path needs to match the path loaded in the iframe in dev/index.js
    app.get('/gas/*', (req, res) => {
      res.setHeader('Content-Type', 'text/html');
      fs.createReadStream(gasWebpackDevServerPath).pipe(res);
    });
  },
};

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  // use key and cert settings only if they are found
  devServer.https = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
}

// webpack settings for the development client wrapper
const devClientConfigs = clientEntrypoints.map((clientEntrypoint) => {
  envVars.FILENAME = clientEntrypoint.filename;
  return {
    ...clientConfig,
    name: `development: ${clientEntrypoint.name}`,
    entry: devDialogEntry,
    plugins: [
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(envVars),
      }),
      new HtmlWebpackPlugin({
        template: './dev/index.html',
        scriptLoading: 'blocking',
        publicPath: 'auto',
        hash: true,
        // this should match the html files we load in src/server/ui.js
        filename: `${clientEntrypoint.filename}.html`,
      }),
      new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [
        new RegExp('^[^(//)]+.(js|css).*$'),
      ]),
    ],
  };
});

// webpack settings used by the server-side code
const serverConfig = {
  context,
  name: 'SERVER',
  // server config can't use 'development' mode
  // https://github.com/fossamagna/gas-webpack-plugin/issues/135
  mode: isProd ? 'production' : 'none',
  entry: serverEntry,
  output: {
    filename: 'code.js',
    path: destination,
    libraryTarget: 'this',
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  module: {
    rules: [
      // typescript config
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
        },
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          // ecma 5 is needed to support Rhino "DEPRECATED_ES5" runtime
          // can use ecma 6 if V8 runtime is used
          ecma: 5,
          warnings: false,
          parse: {},
          compress: {
            properties: false,
          },
          mangle: false,
          module: false,
          output: {
            beautify: true,
            // support custom function autocompletion
            // https://developers.google.com/apps-script/guides/sheets/functions
            comments: /@customfunction/,
          },
        },
      }),
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(envVars),
      'process.env.NODE_ENV': JSON.stringify(
        isProd ? 'production' : 'development'
      ),
    }),
    new GasPlugin(),
  ],
};

module.exports = [
  // 1. Copy appsscript.json to destination,
  // 2. Set up webpack dev server during development
  // Note: devServer settings are only read in the first element when module.exports is an array
  { ...copyFilesConfig, ...(isProd ? {} : { devServer }) },
  // 3. Create the server bundle
  serverConfig,
  // 4. Create one client bundle for each client entrypoint.
  ...clientConfigs,
  // 5. Create a development dialog bundle for each client entrypoint during development.
  ...(isProd ? [] : devClientConfigs),
];
