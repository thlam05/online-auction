/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './src/resources/views/**/*.handlebars',
        './src/public/**/*.js',
        './node_modules/preline/dist/*.js',
    ],
    plugins: [
        await import('preline/plugin')
    ],
}
