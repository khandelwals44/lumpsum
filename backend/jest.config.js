/** @type {import('jest').Config} */
export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)sx?$": ["ts-jest", { useESM: true, tsconfig: "tsconfig.json" }]
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: ['**/tests/simple.test.ts', '**/tests/health.test.ts', '**/tests/auth.test.ts'],
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^@prisma/client$": "<rootDir>/tests/prismaMock.ts",
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  transformIgnorePatterns: ["/node_modules/"],
  collectCoverageFrom: ["src/**/*.ts", "!src/index.ts"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coverageReporters: ['text', 'json', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};
