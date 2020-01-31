// See https://dev.to/robertcoopercode/using-eslint-and-prettier-in-a-typescript-project-53jb
module.exports =  {
  // Specify the ESLint parser:
  parser:  '@typescript-eslint/parser',
  extends:  [
     // Use the recommended rules from the @typescript-eslint/eslint-plugin:
    'plugin:@typescript-eslint/recommended',
     // Use eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier:
    'prettier/@typescript-eslint', 
     // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    'plugin:prettier/recommended', 
  ],
 parserOptions:  {
    ecmaVersion:  2018,  // Allows for the parsing of modern ECMAScript features
    sourceType:  'module',  // Allows for the use of imports
  },
  rules:  {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
  },
};
