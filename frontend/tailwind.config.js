// tailwind.config.js
// Tells Tailwind which files to scan for class names.
// Anything inside src/ that uses .js / .jsx / .html will be checked.

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
