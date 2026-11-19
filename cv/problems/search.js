import { problem as p, topic, ints as a, matrix as m, list as l } from './schema.js';

export const search = topic('sorting-binary-search', 'Sorting & Binary Search', 'Bound searches, comparators, and interval merging.', 'Hard', [
  p('int lowerBound(int[] sorted, int target)', 'Return the first index with value greater than or equal to target, or the array length if there is none. The array is sorted ascending.',
    'Search the half-open interval [lo, hi), keeping hi as an allowed answer.',
    'int lo = 0, hi = sorted.length;\nwhile (lo < hi) {\n    int mid = lo + (hi - lo) / 2;\n    if (sorted[mid] < target) lo = mid + 1;\n    else hi = mid;\n}\nreturn lo;',
    [[[a(1,3,3,9),3],1], [[a(1,2),8],2], [[a(),0],0], [[a(4,5),1],0], [[a(2,2),2],0]]),
  p('int upperBound(int[] sorted, int target)', 'Return the first index with value strictly greater than target, or the array length if there is none. The array is sorted ascending.',
    'Move lo past values equal to target too.',
    'int lo = 0, hi = sorted.length;\nwhile (lo < hi) {\n    int mid = lo + (hi - lo) / 2;\n    if (sorted[mid] <= target) lo = mid + 1;\n    else hi = mid;\n}\nreturn lo;',
    [[[a(1,3,3,9),3],3], [[a(1,2),2],2], [[a(),0],0], [[a(7,9),5],0], [[a(2,2,8),2],2]]),
  p('List<String> sortByLength(List<String> words)', 'Return the words sorted by increasing UTF-16 length, breaking ties by natural string ordering. Keep duplicates.',
    'Chain comparingInt and thenComparing.',
    'List<String> out = new ArrayList<>(words);\nout.sort(Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder()));\nreturn out;',
    [[[l('pear','a','pie','bee')],l('a','bee','pie','pear')], [[l('b','A','')],l('','A','b')], [[l()],l()], [[l('bb','aa','aa')],l('aa','aa','bb')], [[l('one')],l('one')]]),
  p('int[][] mergeClosed(int[][] intervals)', 'Merge overlapping closed intervals into a list of disjoint intervals sorted by start. Intervals sharing an endpoint overlap. Each pair has start at most end.',
    'Sort by start, then merge into the last interval when its end reaches the next start.',
    'int[][] ordered = intervals.clone();\nArrays.sort(ordered, Comparator.comparingInt(pair -> pair[0]));\nList<int[]> merged = new ArrayList<>();\nfor (int[] next : ordered) {\n    int[] last = merged.isEmpty() ? null : merged.get(merged.size() - 1);\n    if (last == null || next[0] > last[1]) merged.add(next.clone());\n    else last[1] = Math.max(last[1], next[1]);\n}\nreturn merged.toArray(new int[0][]);',
    [[[m([5,7],[1,3],[3,4])],m([1,4],[5,7])], [[m([2,3],[1,5])],m([1,5])], [[m()],m()], [[m([1,1],[2,2])],m([1,1],[2,2])], [[m([-5,0],[0,5],[4,9])],m([-5,9])]]),
  p('int rotatedIndex(int[] nums, int target)', 'Return the target index in a rotated ascending array of distinct values, or -1 when absent. Aim for logarithmic time.',
    'One half is sorted at each midpoint. Decide whether the target is within that half’s bounds.',
    'int lo = 0, hi = nums.length - 1;\nwhile (lo <= hi) {\n    int mid = lo + (hi - lo) / 2;\n    if (nums[mid] == target) return mid;\n    if (nums[lo] <= nums[mid]) {\n        if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;\n        else lo = mid + 1;\n    } else if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;\n    else hi = mid - 1;\n}\nreturn -1;',
    [[[a(4,5,7,1,2),1],3], [[a(2,3,4,0,1),9],-1], [[a(),1],-1], [[a(2,1),1],1], [[a(-3,0,4),-3],0]])
]);
