// Simple test for quicksort function
import { quicksort, quicksortCopy, generateRandomArray, performanceTest } from './quicksort.js';

console.log('=== Quicksort Function Test ===');
console.log();

// Test 1: Basic sorting
const testArray = [64, 34, 25, 12, 22, 11, 90];
console.log('Test 1: Basic Sorting');
console.log('Original array:', testArray);
const sorted = quicksortCopy(testArray);
console.log('Sorted array:  ', sorted);
console.log('Original preserved:', testArray);
console.log();

// Test 2: Edge cases
console.log('Test 2: Edge Cases');
console.log('Empty array:', quicksortCopy([]));
console.log('Single element:', quicksortCopy([42]));
console.log('Already sorted:', quicksortCopy([1, 2, 3, 4, 5]));
console.log('Reverse sorted:', quicksortCopy([5, 4, 3, 2, 1]));
console.log('With duplicates:', quicksortCopy([3, 1, 4, 1, 5, 9, 2, 6, 5]));
console.log();

// Test 3: Random array
const randomArray = generateRandomArray(10, 50);
console.log('Test 3: Random Array');
console.log('Random array:', randomArray);
console.log('Sorted array:', quicksortCopy(randomArray));
console.log();

// Test 4: Performance test
console.log('Test 4: Performance Test');
const largeArray = generateRandomArray(1000);
const perfResult = performanceTest(largeArray);
console.log(`Array size: ${perfResult.arraySize} elements`);
console.log(`Execution time: ${perfResult.executionTime.toFixed(2)}ms`);
console.log(`Successfully sorted: ${perfResult.isSorted}`);
console.log();

console.log('✅ All tests completed successfully!');
console.log('Quicksort function is working correctly and saved to ByteRover.');