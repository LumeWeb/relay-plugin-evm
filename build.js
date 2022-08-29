import esbuild from 'esbuild'

esbuild.buildSync({
    entryPoints: ['src/index.ts'],
    outfile: 'dist/evm.js',
    format: 'cjs',
    bundle: true,
    platform: "node"
})
