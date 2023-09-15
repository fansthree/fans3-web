module.exports = {
  map: process.env.NODE_ENV === 'development',
  plugins: [
    require('postcss-import'),
    require('tailwindcss/nesting')(require('postcss-nesting')),
    require('tailwindcss')({ config: __dirname + '/tailwind.config.cjs' }),
    require('postcss-preset-env')({ stage: 0, features: { 'nesting-rules': false } }),
    require('autoprefixer')
  ]
}
