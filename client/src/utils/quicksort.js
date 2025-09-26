 /**
 * QuickSort Algorithm Implementation in JavaScript
 * 
 * QuickSort is a highly efficient sorting algorithm that uses a divide-and-conquer approach.
 * It works by selecting a 'pivot' element from the array and partitioning the other elements
 * into two sub-arrays according to whether they are less than or greater than the pivot.
 * 
 * Time Complexity:
 * - Best Case: O(n log n)
 * - Average Case: O(n log n) 
 * - Worst Case: O(n²) - when pivot is always the smallest or largest element
 * 
 * Space Complexity: O(log n) - due to recursive call stack
 */

/**
 * Partitions the array around a pivot element
 * @param {number[]} arr - The array to partition
 * @param {number} low - Starting index
 * @param {number} high - Ending index
 * @returns {number} - The partition index
 */
function partition(arr, low, high) {
    // Choose the rightmost element as pivot
    const pivot = arr[high];
    
    // Index of smaller element, indicates the right position of pivot found so far
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
        // If current element is smaller than or equal to pivot
        if (arr[j] <= pivot) {
            i++; // increment index of smaller element
            [arr[i], arr[j]] = [arr[j], arr[i]]; // swap elements
        }
    }
    
    // Place pivot in its correct position
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    
    return i + 1; // return partition index
}

/**
 * Main QuickSort function (recursive implementation)
 * @param {number[]} arr - The array to sort
 * @param {number} low - Starting index (default: 0)
 * @param {number} high - Ending index (default: arr.length - 1)
 * @returns {number[]} - The sorted array
 */
function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        // Partition the array and get the partition index
        const partitionIndex = partition(arr, low, high);
        
        // Recursively sort elements before and after partition
        quickSort(arr, low, partitionIndex - 1);
        quickSort(arr, partitionIndex + 1, high);
    }
    
    return arr;
}

/**
 * QuickSort wrapper function for easier usage
 * Creates a copy of the array to avoid mutating the original
 * @param {number[]} arr - The array to sort
 * @returns {number[]} - A new sorted array
 */
function quickSortCopy(arr) {
    if (!Array.isArray(arr)) {
        throw new Error('Input must be an array');
    }
    
    if (arr.length <= 1) {
        return [...arr];
    }
    
    const arrCopy = [...arr];
    return quickSort(arrCopy);
}

/**
 * In-place QuickSort function
 * Sorts the original array without creating a copy
 * @param {number[]} arr - The array to sort in-place
 * @returns {number[]} - The same array, now sorted
 */
function quickSortInPlace(arr) {
    if (!Array.isArray(arr)) {
        throw new Error('Input must be an array');
    }
    
    if (arr.length <= 1) {
        return arr;
    }
    
    return quickSort(arr);
}

// Export functions for use in other modules
export { quickSort, quickSortCopy, quickSortInPlace, partition };

// Example usage and testing
if (typeof window !== 'undefined') {
    // Browser environment - attach to window for global access
    window.quickSort = { quickSort, quickSortCopy, quickSortInPlace };
    
    // Example usage
    console.log('QuickSort Examples:');
    
    const testArray1 = [64, 34, 25, 12, 22, 11, 90];
    console.log('Original array:', testArray1);
    console.log('Sorted array (copy):', quickSortCopy(testArray1));
    console.log('Original unchanged:', testArray1);
    
    const testArray2 = [64, 34, 25, 12, 22, 11, 90];
    console.log('\nIn-place sorting:');
    console.log('Before:', testArray2);
    quickSortInPlace(testArray2);
    console.log('After:', testArray2);
    
    // Edge cases
    console.log('\nEdge cases:');
    console.log('Empty array:', quickSortCopy([]));
    console.log('Single element:', quickSortCopy([42]));
    console.log('Already sorted:', quickSortCopy([1, 2, 3, 4, 5]));
    console.log('Reverse sorted:', quickSortCopy([5, 4, 3, 2, 1]));
    console.log('Duplicates:', quickSortCopy([3, 1, 4, 1, 5, 9, 2, 6, 5]));
}

// Node.js environment export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { quickSort, quickSortCopy, quickSortInPlace, partition };
}