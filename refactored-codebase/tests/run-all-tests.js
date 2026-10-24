/**
 * Master Test Runner for GoCar Refactored System
 * Runs both the acceptance criteria test suite and the refactored unit test suite.
 */

const { spawnSync } = require('child_process');
const path = require('path');

console.log('====================================================');
console.log('   GOCAR CAR RENTAL SYSTEM — MASTER TEST RUNNER    ');
console.log('====================================================\n');

let totalSuites = 0;
let passedSuites = 0;

function runSuite(file, title) {
  totalSuites++;
  console.log(`>>> Running Suite ${totalSuites}: ${title}`);
  const result = spawnSync('node', [path.join(__dirname, file)], {
    stdio: 'inherit',
    encoding: 'utf8'
  });

  if (result.status === 0) {
    passedSuites++;
    console.log(`[SUITE PASSED]: ${title}\n`);
  } else {
    console.error(`[SUITE FAILED]: ${title} with exit code ${result.status}\n`);
    process.exitCode = 1;
  }
}

runSuite('acceptance.test.js', 'System Acceptance Criteria (18 Tests)');
runSuite('unit-refactored.test.js', 'Refactored Units, BadgeUtils & Security Regression (32 Tests)');

console.log('====================================================');
console.log(`TOTAL SUITES EXECUTED: ${totalSuites}`);
console.log(`TOTAL SUITES PASSED:   ${passedSuites}`);
console.log(`TOTAL TEST ASSERTIONS: 50 (18 Acceptance + 32 Unit)`);
console.log('====================================================');
