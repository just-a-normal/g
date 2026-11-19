import { problem as p, topic, ints as a, matrix as m, expression as e } from './schema.js';

export const array1 = topic('array-1', 'Array-1', 'Indexing, copying, and working with array boundaries.', 'Easy', [
  p('int edgeSum(int[] nums)', 'Sum only the first and last entries. Count a singleton once and return zero for empty.', 'Handle lengths zero and one before reading two positions.',
    'int n = nums.length;\nif (n == 0) return 0;\nreturn n == 1 ? nums[0] : nums[0] + nums[n - 1];',
    [[[a(2,9,6)],8], [[a(7)],7], [[a()],0], [[a(-8,2)],-6], [[a(0,5,0)],0]]),
  p('int[] rotateOne(int[] nums)', 'Return a new array with the first entry moved to the end and every other entry shifted left once.',
    'Read the source at (index + 1) modulo the length.',
    'int[] out = new int[nums.length];\nfor (int i = 0; i < nums.length; i++) out[i] = nums[(i + 1) % nums.length];\nreturn out;',
    [[[a(4,1,7)],a(1,7,4)], [[a(5)],a(5)], [[a()],a()], [[a(-1,0)],a(0,-1)], [[a(2,2,1)],a(2,1,2)]]),
  p('int[] joinEdges(int[] left, int[] right)', 'Return the last entry from left followed by the first from right. Omit the entry for any empty array.',
    'Allocate one slot per nonempty array.',
    'int[] out = new int[(left.length == 0 ? 0 : 1) + (right.length == 0 ? 0 : 1)];\nif (left.length > 0) out[0] = left[left.length - 1];\nif (right.length > 0) out[out.length - 1] = right[0];\nreturn out;',
    [[[a(2,3),a(8,9)],a(3,8)], [[a(),a(8)],a(8)], [[a(2),a()],a(2)], [[a(),a()],a()], [[a(0),a(-1,1)],a(0,-1)]]),
  p('boolean hasMirrorEdges(int[] nums)', 'Check whether the first two values match the last two in reverse order. Require at least four entries.',
    'Compare index 0 with length - 1, then index 1 with length - 2.',
    'int n = nums.length;\nreturn n >= 4 && nums[0] == nums[n - 1] && nums[1] == nums[n - 2];',
    [[[a(2,4,4,2)],true], [[a(2,4,2,4)],false], [[a(4,4,4)],false], [[a(1,2,9,3,2,1)],true], [[a()],false]]),
  p('int[] safeSlice(int[] nums, int from, int to)', 'Copy the half-open range [from, to) after clamping both bounds into [0, length]. Return an empty array if the clamped range is reversed.',
    'Clamp each end separately and use Arrays.copyOfRange.',
    'int start = Math.max(0, Math.min(nums.length, from));\nint end = Math.max(start, Math.min(nums.length, to));\nreturn Arrays.copyOfRange(nums, start, end);',
    [[[a(4,5,6),1,3],a(5,6)], [[a(1,2),-5,12],a(1,2)], [[a(1,2),2,0],a()], [[a(),0,8],a()], [[a(7),-2,-1],a()]])
]);

export const array2 = topic('array-2', 'Array-2', 'Array scans, rolling sums, and in-place updates.', 'Medium', [
  p('int[] prefixTotals(int[] nums)', 'Return a same-length array where each entry is the sum from index zero through that index. Sums fit in int.',
    'Keep a running sum between iterations.',
    'int[] out = new int[nums.length];\nint sum = 0;\nfor (int i = 0; i < nums.length; i++) out[i] = (sum += nums[i]);\nreturn out;',
    [[[a(3,2,-1)],a(3,5,4)], [[a(-3,3)],a(-3,0)], [[a()],a()], [[a(0,0)],a(0,0)], [[a(42)],a(42)]]),
  p('int longestRise(int[] nums)', 'Find the length of the longest contiguous, strictly increasing run. Return 0 for empty.',
    'Reset the current run to one whenever it stops increasing.',
    'int best = 0, run = 0;\nfor (int i = 0; i < nums.length; i++) {\n    run = i > 0 && nums[i] > nums[i - 1] ? run + 1 : 1;\n    best = Math.max(best, run);\n}\nreturn best;',
    [[[a(1,2,2,3,4)],3], [[a(5,4,3)],1], [[a()],0], [[a(1,2,3)],3], [[a(0,0)],1]]),
  p('int windowPeak(int[] nums, int k)', 'Return the greatest sum of exactly k consecutive entries, or 0 if k is outside 1 through the array length. Window sums fit in int.',
    'Subtract the outgoing value and add the incoming value when sliding.',
    'if (k < 1 || k > nums.length) return 0;\nlong sum = 0;\nfor (int i = 0; i < k; i++) sum += nums[i];\nlong best = sum;\nfor (int i = k; i < nums.length; i++) {\n    sum += (long) nums[i] - nums[i - k];\n    best = Math.max(best, sum);\n}\nreturn (int) best;',
    [[[a(3,-2,5,6),2],11], [[a(-8,-5,-3),2],-8], [[a(4),2],0], [[a(9),0],0], [[a(7,-9),2],-2]]),
  p('void moveZeros(int[] nums)', 'Move all zero entries to the end of the supplied array in place. Preserve the relative order of all nonzero entries.',
    'Write nonzero elements with a separate index and then fill the tail.',
    'int write = 0;\nfor (int value : nums) if (value != 0) nums[write++] = value;\nArrays.fill(nums, write, nums.length, 0);',
    [], { tests: [
      [[0,5,0,2], a(5,2,0,0)], [[0,0], a(0,0)], [[4,-3], a(4,-3)], [[], a()], [[0,-1,0,-2,0], a(-1,-2,0,0,0)]
    ].map(([input, expected], i) => ({
      call: 'moveZeros(' + a(...input).display + ')',
      setup: 'int[] input = ' + a(...input).java + '; new Solution().moveZeros(input);',
      invoke: 'input', expected: expected.java, expectedDisplay: expected.display, hidden: i >= 3
    })) }),
  p('int pivotIndex(int[] nums)', 'Return the earliest index whose strictly left and strictly right sums match, or -1 if no index qualifies.',
    'Track the left sum and derive the right sum from the total.',
    'long total = 0, left = 0;\nfor (int num : nums) total += num;\nfor (int i = 0; i < nums.length; i++) {\n    if (left == total - left - nums[i]) return i;\n    left += nums[i];\n}\nreturn -1;',
    [[[a(1,7,3,6,5,6)],3], [[a(0,0)],0], [[a(1,2,3)],-1], [[a()],-1], [[a(5)],0]])
]);

export const array3 = topic('array-3', 'Array-3', 'Matrices, prefix sums, and multi-array algorithms.', 'Hard', [
  p('int[] rowTotals(int[][] grid)', 'Return the sum of each row. Row lengths may differ and empty rows contribute zero. Sums fit in int.',
    'An inner loop visits the current row only.',
    'int[] out = new int[grid.length];\nfor (int r = 0; r < grid.length; r++) for (int value : grid[r]) out[r] += value;\nreturn out;',
    [[[m([1,2],[-1,4,7],[])],a(3,10,0)], [[m()],a()], [[m([-4])],a(-4)], [[m([],[])],a(0,0)], [[m([0,0],[9])],a(0,9)]]),
  p('int[][] transposeGrid(int[][] grid)', 'Transpose a rectangular matrix so row r, column c becomes row c, column r. A matrix with no rows or no columns yields an empty matrix.',
    'Allocate the output with the two dimensions exchanged.',
    'if (grid.length == 0) return new int[0][];\nint[][] out = new int[grid[0].length][grid.length];\nfor (int r = 0; r < grid.length; r++) {\n    for (int c = 0; c < grid[r].length; c++) out[c][r] = grid[r][c];\n}\nreturn out;',
    [[[m([1,2,3],[4,5,6])],m([1,4],[2,5],[3,6])], [[m([7])],m([7])], [[m()],m()], [[m([],[])],m()], [[m([3],[-2])],m([3,-2])]]),
  p('int countTargetRanges(int[] nums, int target)', 'Count nonempty contiguous ranges summing to target, including overlapping ranges. The count fits in int.',
    'Count earlier prefix sums equal to the current prefix minus target.',
    'Map<Long,Integer> counts = new HashMap<>();\ncounts.put(0L, 1);\nlong sum = 0;\nint total = 0;\nfor (int value : nums) {\n    sum += value;\n    total += counts.getOrDefault(sum - target, 0);\n    counts.merge(sum, 1, Integer::sum);\n}\nreturn total;',
    [[[a(1,1,1),2],2], [[a(1,-1,0),0],3], [[a(),0],0], [[a(0,0,0),0],6], [[a(2147483647,1),-2147483648],0]]),
  p('int[][] rotateGrid(int[][] square)', 'Rotate a square matrix 90 degrees clockwise in place, then return the same matrix.',
    'Transpose across the main diagonal, then reverse every row.',
    'int n = square.length;\nfor (int r = 0; r < n; r++) for (int c = r + 1; c < n; c++) {\n    int tmp = square[r][c];\n    square[r][c] = square[c][r];\n    square[c][r] = tmp;\n}\nfor (int[] row : square) for (int i = 0; i < n / 2; i++) {\n    int j = n - 1 - i, tmp = row[i];\n    row[i] = row[j];\n    row[j] = tmp;\n}\nreturn square;',
    [], { tests: [
      [m([1,2],[3,4]),m([3,1],[4,2])], [m([8]),m([8])], [m(),m()],
      [m([1,2,3],[4,5,6],[7,8,9]),m([7,4,1],[8,5,2],[9,6,3])], [m([-1,0],[2,9]),m([2,-1],[9,0])]
    ].map(([input, expected], i) => ({
      call: 'rotateGrid(' + input.display + ')',
      setup: 'int[][] input = ' + input.java + '; int[][] rotated = new Solution().rotateGrid(input); ' +
        'if (rotated != input) throw new AssertionError("Return the original matrix");',
      invoke: 'rotated', expected: expected.java, expectedDisplay: expected.display, hidden: i >= 3
    })) }),
  p('long trappedWater(int[] height)', 'Each nonnegative height represents a unit-width bar. Return the total water trapped above the bars after rainfall.',
    'The water at a position is limited by the smaller of the highest bars to either side.',
    'int left = 0, right = height.length - 1, leftMax = 0, rightMax = 0;\nlong water = 0;\nwhile (left <= right) {\n    if (leftMax <= rightMax) {\n        leftMax = Math.max(leftMax, height[left]);\n        water += leftMax - height[left++];\n    } else {\n        rightMax = Math.max(rightMax, height[right]);\n        water += rightMax - height[right--];\n    }\n}\nreturn water;',
    [[[a(3,0,2,0,4)],e('7L','7')], [[a(1,2,3)],e('0L','0')], [[a(2,0,2)],e('2L','2')], [[a()],e('0L','0')], [[a(2147483647,0,0,2147483647)],e('4294967294L','4294967294')]])
]);
