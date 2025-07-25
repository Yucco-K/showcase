const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['index.cjs'],        // Lambdaのエントリーファイル名を指定
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/index.js',
  minify: true,
  external: ['aws-sdk'],            // Lambdaに含まれているので除外
}).catch(() => process.exit(1));

