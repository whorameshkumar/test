/** @type {import('ts-jest').JestConfigWithTsJest} **/

module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+.tsx?$': ['ts-jest', {}],
    },
    verbose: true,
    coverageProvider: "v8", // nodejs mein JS kaa engine v8 hota hai
    collectCoverageFrom: [
        "src/**/*.ts", // src mein jitni ts files hain wo chaiye
        "!tests/**", // tests folder ki coverage ignore kro, baqi sarye code ki kro
        "!**/node_modules/**" // ignore node_modules folder also 
        ],
};
 