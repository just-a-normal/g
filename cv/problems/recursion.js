import { problem as p, topic, ints as a, list as l } from './schema.js';

export const recursion1 = topic('recursion-1', 'Recursion-1', 'Base cases and recursive work on strings and numbers.', 'Medium', [
  p('int countDigits(int n)', 'Use recursion to count the decimal digits of a nonnegative integer. Zero has one digit.',
    'Each division by ten removes one digit.',
    'return n < 10 ? 1 : 1 + countDigits(n / 10);',
    [[[8234],4], [[0],1], [[9],1], [[10],2], [[2147483647],10]]),
  p('String starsBetween(String text)', 'Using recursion, insert "*" between adjacent ASCII characters. Leave strings of length zero or one unchanged.',
    'Separate the first character from the remaining substring.',
    'if (text.length() < 2) return text;\nreturn text.charAt(0) + "*" + starsBetween(text.substring(1));',
    [[['abc'],'a*b*c'], [['a'],'a'], [[''],''], [['  '],' * '], [['abca'],'a*b*c*a']]),
  p('int gcd(int a, int b)', 'Use recursive Euclid’s algorithm to find the greatest common divisor of two nonnegative integers. Return 0 when both are zero.',
    'When b is nonzero, recurse with b and a % b.',
    'return b == 0 ? a : gcd(b, a % b);',
    [[[48,18],6], [[17,13],1], [[0,6],6], [[0,0],0], [[12,0],12]]),
  p('boolean recursivePalindrome(String text)', 'Use recursion to test whether an ASCII string reads the same forward and backward, including case and spaces.',
    'Check matching ends before recursing on the interior.',
    'int n = text.length();\nreturn n < 2 || (text.charAt(0) == text.charAt(n - 1) && recursivePalindrome(text.substring(1, n - 1)));',
    [[['racecar'],true], [['Java'],false], [[''],true], [['a A'],false], [[' abba '],true]]),
  p('int sumSevens(int n)', 'Use recursion to count occurrences of the digit 7 in a nonnegative integer.',
    'Inspect the last digit, then recurse on the quotient by ten.',
    'if (n == 0) return 0;\nreturn (n % 10 == 7 ? 1 : 0) + sumSevens(n / 10);',
    [[[7077],3], [[12],0], [[7],1], [[0],0], [[1777777777],9]])
]);

export const recursion2 = topic('recursion-2', 'Recursion-2', 'Backtracking, constrained subsets, and balanced sequences.', 'Hard', [
  p('boolean subsetTarget(int index, int[] nums, int target)', 'Starting at index, determine if any subset sums to target. Values may be negative. Use each position at most once, and allow the empty subset. Inputs have at most 20 entries and all intermediate sums fit in int.',
    'Try including the current entry and skipping it.',
    'if (index == nums.length) return target == 0;\nreturn subsetTarget(index + 1, nums, target - nums[index]) || subsetTarget(index + 1, nums, target);',
    [[[0,a(2,4,8),10],true], [[0,a(2,4,8),7],false], [[0,a(4,-3),1],true], [[0,a(),0],true], [[1,a(5,2),5],false]]),
  p('boolean groupWithFours(int index, int[] nums, int target)', 'Select a subset of entries from index onward that sums to target. Every multiple of four must be selected, including zero. Values are nonnegative, inputs have at most 20 entries, and intermediate sums fit in int.',
    'Skip the exclusion branch for multiples of four.',
    'if (index == nums.length) return target == 0;\nint n = nums[index];\nreturn groupWithFours(index + 1, nums, target - n)\n    || (n % 4 != 0 && groupWithFours(index + 1, nums, target));',
    [[[0,a(4,1,7),5],true], [[0,a(4,1,7),7],false], [[0,a(0,8),8],true], [[0,a(),2],false], [[1,a(12,4,2),6],true]]),
  p('int countStairWays(int steps)', 'Count ways to climb exactly steps using moves of size 1 or 2. Order matters. Zero remaining steps is one completed climb. Inputs are 0 through 20.',
    'Each first move leaves a smaller staircase.',
    'if (steps < 2) return 1;\nreturn countStairWays(steps - 1) + countStairWays(steps - 2);',
    [[[4],5], [[0],1], [[2],2], [[1],1], [[10],89]]),
  p('boolean nonAdjacentTarget(int index, int[] nums, int target)', 'Check whether any subset from index onward sums to target with no selected indices adjacent. The empty subset is allowed. Inputs have at most 20 entries and intermediate sums fit in int.',
    'After picking an entry, advance by two positions.',
    'if (index >= nums.length) return target == 0;\nreturn nonAdjacentTarget(index + 2, nums, target - nums[index]) || nonAdjacentTarget(index + 1, nums, target);',
    [[[0,a(3,5,7),10],true], [[0,a(3,5,7),8],false], [[0,a(),0],true], [[0,a(5,-1,-3),2],true], [[1,a(1,3,4),7],false]]),
  p('List<String> balancedPairs(int pairs)', 'Generate all strings containing exactly pairs matched pairs of parentheses, in lexicographic order. There is one empty result string for zero pairs. Inputs are 0 through 7.',
    'Build a prefix left to right. Add ")" only when there is an unclosed "(".',
    '',
    [
      [[2],l('(())','()()')], [[1],l('()')], [[0],l('')],
      [[3],l('((()))','(()())','(())()','()(())','()()()')],
      [[4],l('(((())))','((()()))','((())())','((()))()','(()(()))','(()()())','(()())()',
        '(())(())','(())()()','()((()))','()(()())','()(())()','()()(())','()()()()')]
    ],
    { solution: `public List<String> balancedPairs(int pairs) {
    List<String> out = new ArrayList<>();
    collectPairs("", pairs, 0, out);
    return out;
}

private void collectPairs(String prefix, int remaining, int open, List<String> out) {
    if (remaining == 0 && open == 0) {
        out.add(prefix);
        return;
    }
    if (remaining > 0) collectPairs(prefix + "(", remaining - 1, open + 1, out);
    if (open > 0) collectPairs(prefix + ")", remaining, open - 1, out);
}` })
]);
