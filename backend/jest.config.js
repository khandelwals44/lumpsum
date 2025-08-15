/** @type {import('jest').Config} */
export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)sx?$": ["ts-jest", { useESM: true, tsconfig: "tsconfig.json" }]
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^@prisma/client$": "<rootDir>/tests/prismaMock.ts"
  },
  transformIgnorePatterns: ["/node_modules/"],
  collectCoverageFrom: ["src/**/*.ts", "!src/index.ts"]
};
