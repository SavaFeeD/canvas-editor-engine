# Canvas 2D library

Sprite creator lib;

Use: [`typescript`] [`canvas`];

## Requirements

|Name|Version |
|----|--------|
|npm | `10.8.3` |
|node | `20.10.0` |
|acorn | `8.10.0` |
|ada | `2.7.2` |
|ares | `1.20.1` |
|base64 | `0.5.0` |
|brotli | `1.0.9` |
|cjs_module_lexer | `1.2.2` |
|cldr | `43.1` |
|icu | `73.2` |
|llhttp | `8.1.1` |
|modules | `115` |
|napi | `9` |
|nghttp2 | `1.57.0` |
|nghttp3 | `0.7.0` |
|ngtcp2 | `0.8.1` |
|openssl | `3.0.12+quic` |
|simdutf | `3.2.18` |
|tz | `2023c` |
|undici | `5.26.4` |
|unicode | `15.0` |
|uv | `1.46.0` |
|uvwasi | `0.0.19` |
|v8 | `11.3.244.8-node.25` |
|zlib | `1.2.13.1-motley` |

## Start

1. `npm install` - install npm dependencies;
2. `npm run watch` - auto update <b>dist</b> after making changes in project;
3. <i>update files in</i> <b>src</b> <i>folder</i>
4. `npm run realise` - Increase the version of the patch and publish the npm package;
5. <i>repeat..</i>

## NPM Scripts

|Name | Runs the command    | Description |
|-----|---------------------|-------------|
|`test` | `node test/test.js` | Run tests |
|`watch` | `gulp watch-project` | Run auto update <b>dist</b> after making changes in project |
|`build` | `tsc` | Run create ts build into folder <b>dist</b> | 
|`realise` | `npm version patch && npm publish` | Increase the version of the patch and publish the npm package |
