// import sourcemaps from 'rollup-plugin-sourcemaps'
import * as fs from 'fs'
import {uglify} from 'rollup-plugin-uglify'
import {minify as uglifyEs} from 'uglify-es'
import typescriptPlugin from 'rollup-plugin-typescript2'
import * as typescript from 'typescript'

export default {
	input: 'src/SVGPathData.ts',
	output: [
		{
			format: 'umd',
			file: 'lib/SVGPathData.js',
			sourcemap: true,
      name: 'svgpathdata'
		},
		{
      format: 'es',
      sourcemap: true,
      file: 'lib/SVGPathData.module.js'
    },
  ],
  plugins: [
		typescriptPlugin({
			typescript
		}),
    uglify({}, uglifyEs)
  ],
  // onwarn: function (warning, warn) {
  //   // Suppress this error message... there are hundreds of them. Angular team says to ignore it.
  //   // https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined
  //   if ('THIS_IS_UNDEFINED' === warning.code) return
  //   if ('CIRCULAR_DEPENDENCY' === warning.code) {
	// 		const m = warning.message.match(/^Circular dependency: (.*) -> .* -> .*$/)
	// 		if (m) {
	// 			const start = m[1]
	// 			if (start.match(/out[/\\]index.js|src[/\\]index.ts/)) {
	// 				// this is a loop of length three starting at the index file: don't warn
	// 				return
	// 			}
	// 		}
	// 	}
	// 	warn(warning)
	// },
}
