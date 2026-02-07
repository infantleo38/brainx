export const examQuestion = {
    number: "Question 4 of 20",
    text: "What is the time complexity of the following recursive function for calculating Fibonacci numbers?",
    points: "2 Points",
    codeSnippet: `function fib(n) {
  if (n <= 1) return n;
  return fib(n-1) + fib(n-2);
}`,
    options: [
        'O(n) - Linear Time',
        'O(2^n) - Exponential Time',
        'O(log n) - Logarithmic Time',
        'O(n^2) - Quadratic Time'
    ],
    correctAnswer: 'O(2^n) - Exponential Time'
};

export const examNavigatorData = {
    total: 20,
    current: 4,
    answered: [1, 2, 3],
    flagged: [7], // Question number
};
