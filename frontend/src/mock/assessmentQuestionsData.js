export const assessmentData = {
    id: 1,
    title: "Algorithm Complexity Midterm",
    type: "Midterm Exam",
    totalQuestions: 20,
    totalPoints: 100,
    timeLimit: 60, // minutes
    course: "Algorithm Analysis & Design",
    institution: "Stanford Univ.",
};

export const assessmentQuestions = [
    {
        id: 1,
        questionNumber: 1,
        type: "multiple-choice",
        points: 2,
        question: "What is the worst case time complexity of Quick Sort?",
        options: [
            "O(n log n) - Linearithmic Time",
            "O(n^2) - Quadratic Time",
            "O(n) - Linear Time",
            "O(log n) - Logarithmic Time"
        ],
        correctAnswer: 1,
        userAnswer: null,
        flagged: false
    },
    {
        id: 2,
        questionNumber: 2,
        type: "multiple-choice",
        points: 2,
        question: "Which data structure is best suited for implementing a LRU (Least Recently Used) cache?",
        options: [
            "Array",
            "Hash Map + Doubly Linked List",
            "Binary Search Tree",
            "Stack"
        ],
        correctAnswer: 1,
        userAnswer: null,
        flagged: false
    },
    {
        id: 3,
        questionNumber: 3,
        type: "multiple-choice",
        points: 2,
        question: "What is the space complexity of Merge Sort algorithm?",
        options: [
            "O(1) - Constant Space",
            "O(log n) - Logarithmic Space",
            "O(n) - Linear Space",
            "O(n^2) - Quadratic Space"
        ],
        correctAnswer: 2,
        userAnswer: null,
        flagged: false
    },
    {
        id: 4,
        questionNumber: 4,
        type: "code-analysis",
        points: 2,
        question: "What is the time complexity of the following recursive function for calculating Fibonacci numbers?",
        codeSnippet: `function fib(n) {
  if (n <= 1) return n;
  return fib(n-1) + fib(n-2);
}`,
        options: [
            "O(n) - Linear Time",
            "O(2^n) - Exponential Time",
            "O(log n) - Logarithmic Time",
            "O(n^2) - Quadratic Time"
        ],
        correctAnswer: 1,
        userAnswer: null,
        flagged: false
    },
    {
        id: 5,
        questionNumber: 5,
        type: "multiple-choice",
        points: 2,
        question: "In a balanced Binary Search Tree with n nodes, what is the time complexity to search for an element?",
        options: [
            "O(n) - Linear Time",
            "O(log n) - Logarithmic Time",
            "O(n log n) - Linearithmic Time",
            "O(1) - Constant Time"
        ],
        correctAnswer: 1,
        userAnswer: null,
        flagged: false
    },
    {
        id: 6,
        questionNumber: 6,
        type: "code-analysis",
        points: 2,
        question: "What is the time complexity of this nested loop?",
        codeSnippet: `for (let i = 0; i < n; i++) {
  for (let j = i; j < n; j++) {
    console.log(i, j);
  }
}`,
        options: [
            "O(n) - Linear Time",
            "O(n^2) - Quadratic Time",
            "O(2^n) - Exponential Time",
            "O(n log n) - Linearithmic Time"
        ],
        correctAnswer: 1,
        userAnswer: null,
        flagged: false
    },
    {
        id: 7,
        questionNumber: 7,
        type: "multiple-choice",
        points: 2,
        question: "Which algorithm design paradigm does Dynamic Programming belong to?",
        options: [
            "Divide and Conquer",
            "Greedy Approach",
            "Memoization and Optimal Substructure",
            "Backtracking"
        ],
        correctAnswer: 2,
        userAnswer: null,
        flagged: false
    },
    {
        id: 8,
        questionNumber: 8,
        type: "multiple-choice",
        points: 2,
        question: "What is the minimum time complexity to find the maximum element in an unsorted array?",
        options: [
            "O(1) - Constant Time",
            "O(log n) - Logarithmic Time",
            "O(n) - Linear Time",
            "O(n log n) - Linearithmic Time"
        ],
        correctAnswer: 2,
        userAnswer: null,
        flagged: false
    },
    {
        id: 9,
        questionNumber: 9,
        type: "code-analysis",
        points: 2,
        question: "What is the space complexity of this recursive factorial function?",
        codeSnippet: `function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}`,
        options: [
            "O(1) - Constant Space",
            "O(n) - Linear Space",
            "O(log n) - Logarithmic Space",
            "O(n^2) - Quadratic Space"
        ],
        correctAnswer: 1,
        userAnswer: null,
        flagged: false
    },
    {
        id: 10,
        questionNumber: 10,
        type: "multiple-choice",
        points: 2,
        question: "Which sorting algorithm has the best average-case time complexity?",
        options: [
            "Bubble Sort - O(n^2)",
            "Merge Sort - O(n log n)",
            "Selection Sort - O(n^2)",
            "Insertion Sort - O(n^2)"
        ],
        correctAnswer: 1,
        userAnswer: null,
        flagged: false
    },
    {
        id: 11,
        questionNumber: 11,
        type: "multiple-choice",
        points: 2,
        question: "What is the primary advantage of using a Hash Table?",
        options: [
            "Sorted data storage",
            "O(1) average case lookup time",
            "Memory efficient storage",
            "Maintains insertion order"
        ],
        correctAnswer: 1,
        userAnswer: null,
        flagged: false
    },
    {
        id: 12,
        questionNumber: 12,
        type: "code-analysis",
        points: 2,
        question: "What is the time complexity of binary search?",
        codeSnippet: `function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
        options: [
            "O(n) - Linear Time",
            "O(log n) - Logarithmic Time",
            "O(n log n) - Linearithmic Time",
            "O(1) - Constant Time"
        ],
        correctAnswer: 1,
        userAnswer: null,
        flagged: false
    },
    {
        id: 13,
        questionNumber: 13,
        type: "multiple-choice",
        points: 2,
        question: "Which graph traversal algorithm uses a queue data structure?",
        options: [
            "Depth First Search (DFS)",
            "Breadth First Search (BFS)",
            "Dijkstra's Algorithm",
            "Topological Sort"
        ],
        correctAnswer: 1,
        userAnswer: null,
        flagged: false
    },
    {
        id: 14,
        questionNumber: 14,
        type: "multiple-choice",
        points: 2,
        question: "What is the worst case time complexity of inserting an element in a heap?",
        options: [
            "O(1) - Constant Time",
            "O(log n) - Logarithmic Time",
            "O(n) - Linear Time",
            "O(n log n) - Linearithmic Time"
        ],
        correctAnswer: 1,
        userAnswer: null,
        flagged: false
    },
    {
        id: 15,
        questionNumber: 15,
        type: "multiple-choice",
        points: 2,
        question: "Which of the following is NOT a stable sorting algorithm?",
        options: [
            "Merge Sort",
            "Quick Sort",
            "Insertion Sort",
            "Bubble Sort"
        ],
        correctAnswer: 1,
        userAnswer: null,
        flagged: false
    },
    {
        id: 16,
        questionNumber: 16,
        type: "code-analysis",
        points: 2,
        question: "What will be the output of the following code?",
        codeSnippet: `let arr = [1, 2, 3, 4, 5];
arr.length = 3;
console.log(arr);`,
        options: [
            "[1, 2, 3, 4, 5]",
            "[1, 2, 3]",
            "[4, 5]",
            "Error"
        ],
        correctAnswer: 1,
        userAnswer: null,
        flagged: false
    },
    {
        id: 17,
        questionNumber: 17,
        type: "multiple-choice",
        points: 2,
        question: "In a graph with V vertices and E edges, what is the space complexity of an adjacency matrix representation?",
        options: [
            "O(V) - Linear Space",
            "O(E) - Linear Space",
            "O(V^2) - Quadratic Space",
            "O(V + E) - Linear Space"
        ],
        correctAnswer: 2,
        userAnswer: null,
        flagged: false
    },
    {
        id: 18,
        questionNumber: 18,
        type: "multiple-choice",
        points: 2,
        question: "What is the primary use case for the Trie data structure?",
        options: [
            "Numerical computations",
            "String prefix matching and autocomplete",
            "Graph traversal",
            "Sorting algorithms"
        ],
        correctAnswer: 1,
        userAnswer: null,
        flagged: false
    },
    {
        id: 19,
        questionNumber: 19,
        type: "code-analysis",
        points: 2,
        question: "What is the time complexity of the following code?",
        codeSnippet: `function mystery(n) {
  let count = 0;
  for (let i = n; i > 0; i = Math.floor(i / 2)) {
    count++;
  }
  return count;
}`,
        options: [
            "O(n) - Linear Time",
            "O(log n) - Logarithmic Time",
            "O(n^2) - Quadratic Time",
            "O(1) - Constant Time"
        ],
        correctAnswer: 1,
        userAnswer: null,
        flagged: false
    },
    {
        id: 20,
        questionNumber: 20,
        type: "multiple-choice",
        points: 2,
        question: "Which algorithm is used to find the shortest path in a weighted graph?",
        options: [
            "Breadth First Search",
            "Depth First Search",
            "Dijkstra's Algorithm",
            "Kruskal's Algorithm"
        ],
        correctAnswer: 2,
        userAnswer: null,
        flagged: false
    }
];
