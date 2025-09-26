/**
 * Quicksort Algorithm Implementation in JavaScript
 * 
 * This is an efficient, divide-and-conquer sorting algorithm that works by selecting
 * a 'pivot' element from the array and partitioning the other elements into two
 * sub-arrays according to whether they are less than or greater than the pivot.
 * 
 * Time Complexity:
 * - Best Case: O(n log n)
 * - Average Case: O(n log n) 
 * - Worst Case: O(n²)
 * 
 * Space Complexity: O(log n) due to recursion stack
 */

/**
 * Main quicksort function
 * @param {number[]} arr - Array to be sorted
 * @param {number} low - Starting index (default: 0)
 * @param {number} high - Ending index (default: arr.length - 1)
 * @returns {number[]} - Sorted array
 */
function quicksort(arr, low = 0, high = arr.length - 1) {
    // Base case: if low is less than high, there are elements to sort
    if (low < high) {
        // Partition the array and get the pivot index
        const pivotIndex = partition(arr, low, high);
        
        // Recursively sort elements before and after partition
        quicksort(arr, low, pivotIndex - 1);  // Sort left subarray
        quicksort(arr, pivotIndex + 1, high); // Sort right subarray
    }
    
    return arr;
}

/**
 * Partition function that places the pivot element at its correct position
 * and places all smaller elements to the left and all greater elements to the right
 * @param {number[]} arr - Array to partition
 * @param {number} low - Starting index
 * @param {number} high - Ending index
 * @returns {number} - Index of the pivot element after partitioning
 */
function partition(arr, low, high) {
    // Choose the rightmost element as pivot
    const pivot = arr[high];
    
    // Index of smaller element (indicates right position of pivot found so far)
    let i = low - 1;
    
    // Traverse through all elements
    // Compare each element with pivot
    for (let j = low; j < high; j++) {
        // If current element is smaller than or equal to pivot
        if (arr[j] <= pivot) {
            i++; // Increment index of smaller element
            swap(arr, i, j);
        }
    }
    
    // Place pivot at correct position
    swap(arr, i + 1, high);
    
    return i + 1; // Return position of pivot
}

/**
 * Helper function to swap two elements in an array
 * @param {number[]} arr - Array containing elements to swap
 * @param {number} i - Index of first element
 * @param {number} j - Index of second element
 */
function swap(arr, i, j) {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

/**
 * Alternative implementation using Lomuto partition scheme
 * This version creates a new array instead of sorting in-place
 * @param {number[]} arr - Array to be sorted
 * @returns {number[]} - New sorted array
 */
function quicksortFunctional(arr) {
    // Base case: arrays with 0 or 1 element are already sorted
    if (arr.length <= 1) {
        return arr;
    }
    
    // Choose pivot (middle element for better average performance)
    const pivotIndex = Math.floor(arr.length / 2);
    const pivot = arr[pivotIndex];
    
    // Partition array into three parts
    const less = [];
    const equal = [];
    const greater = [];
    
    for (const element of arr) {
        if (element < pivot) {
            less.push(element);
        } else if (element === pivot) {
            equal.push(element);
        } else {
            greater.push(element);
        }
    }
    
    // Recursively sort the partitions and combine
    return [
        ...quicksortFunctional(less),
        ...equal,
        ...quicksortFunctional(greater)
    ];
}

/**
 * Randomized quicksort to avoid worst-case performance
 * @param {number[]} arr - Array to be sorted
 * @param {number} low - Starting index
 * @param {number} high - Ending index
 * @returns {number[]} - Sorted array
 */
function randomizedQuicksort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        // Randomly choose pivot and swap with last element
        const randomIndex = Math.floor(Math.random() * (high - low + 1)) + low;
        swap(arr, randomIndex, high);
        
        // Proceed with normal quicksort
        const pivotIndex = partition(arr, low, high);
        randomizedQuicksort(arr, low, pivotIndex - 1);
        randomizedQuicksort(arr, pivotIndex + 1, high);
    }
    
    return arr;
}

// Example usage and testing
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        quicksort,
        quicksortFunctional,
        randomizedQuicksort,
        partition,
        swap
    };
} else {
    // Browser environment - add to global scope
    window.quicksort = quicksort;
    window.quicksortFunctional = quicksortFunctional;
    window.randomizedQuicksort = randomizedQuicksort;
}

// Demo and test cases
console.log('=== Quicksort Algorithm Demo ===');

// Test case 1: Random array
const testArray1 = [64, 34, 25, 12, 22, 11, 90];
console.log('Original array:', testArray1);
console.log('Sorted (in-place):', quicksort([...testArray1]));
console.log('Sorted (functional):', quicksortFunctional(testArray1));

// Test case 2: Already sorted array
const testArray2 = [1, 2, 3, 4, 5];
console.log('\nAlready sorted:', testArray2);
console.log('Quicksort result:', quicksort([...testArray2]));

// Test case 3: Reverse sorted array
const testArray3 = [5, 4, 3, 2, 1];
console.log('\nReverse sorted:', testArray3);
console.log('Quicksort result:', quicksort([...testArray3]));

// Test case 4: Array with duplicates
const testArray4 = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3];
console.log('\nWith duplicates:', testArray4);
console.log('Quicksort result:', quicksort([...testArray4]));

// Test case 5: Single element and empty array
console.log('\nEdge cases:');
console.log('Single element [42]:', quicksort([42]));
console.log('Empty array []:', quicksort([]));

// Performance comparison for large arrays
function performanceTest() {
    const size = 10000;
    const largeArray = Array.from({ length: size }, () => Math.floor(Math.random() * 1000));
    
    console.log(`\n=== Performance Test (${size} elements) ===`);
    
    // Test in-place quicksort
    const start1 = performance.now();
    quicksort([...largeArray]);
    const end1 = performance.now();
    console.log(`In-place quicksort: ${(end1 - start1).toFixed(2)}ms`);
    
    // Test functional quicksort
    const start2 = performance.now();
    quicksortFunctional([...largeArray]);
    const end2 = performance.now();
    console.log(`Functional quicksort: ${(end2 - start2).toFixed(2)}ms`);
    
    // Test randomized quicksort
    const start3 = performance.now();
    randomizedQuicksort([...largeArray]);
    const end3 = performance.now();
    console.log(`Randomized quicksort: ${(end3 - start3).toFixed(2)}ms`);
}

// Run performance test if in browser or Node.js with performance API
if (typeof performance !== 'undefined') {
    performanceTest();
}

console.log('\n=== Quicksort Implementation Complete ===');