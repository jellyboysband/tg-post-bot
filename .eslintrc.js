module.exports = {
    root: true,
    env: {
        "browser": true,
        "commonjs": true,
        "es6": true
    },
    extends: [
        "airbnb-base",
        "prettier"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
        "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
        "comma-dangle": [
            "error",
            "always-multiline"
        ],
        "quote-props": ["error", "as-needed"],
        "no-bitwise": ["error", { "allow": ["~"] }]
    }
}