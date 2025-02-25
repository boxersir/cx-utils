import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist/esm',
      format: 'esm',
      preserveModules: true
    },
    {
      dir: 'dist/cjs',
      format: 'cjs',
      preserveModules: true
    }
  ],
  plugins: [typescript()]
}