# Sketch SVGSymbols

SVGSymbols aims to Sketch symbols re-usable across other platforms. It exports`.svgsymbol` files that contain additional metadata about the structure and semantics of the symbol that keeps the overrides defined in sketch (text fields and image placeholders) editable elsewhere, e.g. [in Framer (using framer-svgsymbols)][2] or in your styleguide.


## Implementations
- [sketch-svgsymbols][1] (this repo)
- [framer-svgsymbols][2]

[1]: https://github.com/gerrit/sketch-svgsymbols
[2]: https://github.com/fx-lange/framer-svgsymbols

## TODO

- preserve exact layer names for image overrides in `svgsymbols:name` attribute for overrides, use those as override names
- handle multiple tspans in multiline text fields
- handle text transform (hard, b/c SVG doesn't support it as property, would need to write code in importer to read out special metadata and perform transformation)
- Sketch: kick in only for actual symbol masters? (& instances?)
- include locked layers, but dont make them editable?
- include hidden layers in SVG
- decentralise/handle nested symbols
- maintain constraints

## Dev

``` bash
# build with hot reload
npm run watch

# build for production
npm run build
```

## Custom Configuration

### Babel

To customize Babel, you have two options:

* You may create a [`.babelrc`](https://babeljs.io/docs/usage/babelrc) file in your project's root directory. Any settings you define here will overwrite matching config-keys within skpm preset. For example, if you pass a "presets" object, it will replace & reset all Babel presets that skpm defaults to.

* If you'd like to modify or add to the existing Babel config, you must use a `webpack.skpm.config.js` file. Visit the [Webpack](#webpack) section for more info.

### Webpack

To customize webpack create `webpack.skpm.config.js` file which exports function that will change webpack's config.

```js
/**
 * Function that mutates original webpack config.
 * Supports asynchronous changes when promise is returned.
 *
 * @param {object} config - original webpack config.
 * @param {boolean} isPluginCommand - wether the config is for a plugin command or a resource
 **/
module.exports = function (config, isPluginCommand) {
  /** you can change config here **/
}
```

## Debugging

To view the output of your `console.log`, you have a few different options:
* Open `Console.app` and look for the sketch logs
* Use Safari's web inspector to debug your plugin's javascript context
* Look at the `~/Library/Logs/com.bohemiancoding.sketch3/Plugin Output.log` file

Skpm provides a convenient way to do the latter:

```bash
skpm log
```

The `-f` option causes `skpm log` to not stop when the end of logs is reached, but rather to wait for additional data to be appended to the input

