import { problem as p, topic, ints as a, expression as e } from './schema.js';

const nodeHelper = `class ListNode {
    public int value;
    public ListNode next;
    public ListNode(int value) { this.value = value; }
}`;

export const structures = topic('stacks-queues-lists', 'Stacks, Queues & Linked Lists', 'Deque, priority queues, and linked node operations.', 'Hard', [
  p('boolean bracketsMatch(String text)', 'Check if (), [], and {} brackets are balanced and properly nested. Ignore other characters.',
    'Push opening brackets. Each closing bracket must match the latest opening bracket.',
    'String opens = "([{", closes = ")]}";\nDeque<Integer> stack = new ArrayDeque<>();\nfor (char c : text.toCharArray()) {\n    int open = opens.indexOf(c), close = closes.indexOf(c);\n    if (open >= 0) stack.push(open);\n    else if (close >= 0 && (stack.isEmpty() || stack.pop() != close)) return false;\n}\nreturn stack.isEmpty();',
    [[['a{[()]}'],true], [['([)]'],false], [['plain'],true], [[']'],false], [['(()'],false]]),
  p('int kthLargest(int[] nums, int k)', 'Return the kth largest value, counting duplicates. The array is nonempty and k is between 1 and its length.',
    'Keep a min-heap of the largest k values seen so far.',
    'PriorityQueue<Integer> heap = new PriorityQueue<>();\nfor (int n : nums) {\n    heap.add(n);\n    if (heap.size() > k) heap.remove();\n}\nreturn heap.element();',
    [[[a(3,9,4,1),2],4], [[a(7,7,1),2],7], [[a(-2,-5),2],-5], [[a(1),1],1], [[a(2,5,9),1],9]]),
  p('int[] windowMax(int[] nums, int k)', 'Return the maximum of each window of exactly k consecutive entries. Return an empty array if k is outside 1 through the array length. Aim for linear time.',
    'Store indices in a deque in decreasing order of value and expire old indices from the front.',
    'if (k < 1 || k > nums.length) return new int[0];\nint[] out = new int[nums.length - k + 1];\nDeque<Integer> deque = new ArrayDeque<>();\nfor (int i = 0; i < nums.length; i++) {\n    if (!deque.isEmpty() && deque.peekFirst() <= i - k) deque.removeFirst();\n    while (!deque.isEmpty() && nums[deque.peekLast()] <= nums[i]) deque.removeLast();\n    deque.addLast(i);\n    if (i >= k - 1) out[i - k + 1] = nums[deque.peekFirst()];\n}\nreturn out;',
    [[[a(1,3,-1,-3,5,3,6,7),3],a(3,3,5,5,6,7)], [[a(4,4,2),2],a(4,4)], [[a(3),2],a()], [[a(-7,-3),1],a(-7,-3)], [[a(4,3,2,1),2],a(4,3,2)]]),
  p('int nodeCount(ListNode head)', 'Count nodes in a finite singly linked list. A null head represents an empty list.',
    'Follow next until the current node is null.',
    'int count = 0;\nfor (ListNode node = head; node != null; node = node.next) count++;\nreturn count;', [],
    { helpers: nodeHelper, tests: [[2,3,4],[],[5],[1,1],[0,-1,7,3]].map((input, index) => {
      const test = nodeTest('nodeCount', input, index);
      return { ...test, invoke: 'new Solution().nodeCount(head)', expected: String(input.length), expectedDisplay: String(input.length) };
    }) }),
  p('ListNode reverseNodes(ListNode head)', 'Reverse a finite singly linked list by relinking the original nodes and return the new head. A null head remains null.',
    'Save next before pointing the current node back at its predecessor.',
    'ListNode previous = null;\nwhile (head != null) {\n    ListNode next = head.next;\n    head.next = previous;\n    previous = head;\n    head = next;\n}\nreturn previous;', [],
    { helpers: nodeHelper, tests: [[2,3,4],[],[5],[1,1,2],[0,-1,7,3]].map((input, index) => {
      const test = nodeTest('reverseNodes', input, index);
      const expected = a(...input.slice().reverse());
      const checks = input.map((_, i) =>
        'if (current != n' + (input.length - i - 1) + ') throw new AssertionError("Relink the original nodes"); ' +
        'observed[' + i + '] = current.value; current = current.next;'
      ).join('\n');
      return {
        ...test,
        setup: test.setup + '\nListNode current = new Solution().reverseNodes(head); int[] observed = new int[' +
          input.length + '];\n' + checks + '\nif (current != null) throw new AssertionError("The reversed list must terminate");',
        invoke: 'observed', expected: expected.java, expectedDisplay: expected.display
      };
    }) })
]);

function nodeTest(name, input, index) {
  const setup = input.map((value, i) => 'ListNode n' + i + ' = new ListNode(' + value + ');').join('\n') + '\n' +
    input.slice(1).map((_, i) => 'n' + i + '.next = n' + (i + 1) + ';').join('\n') + '\n' +
    'ListNode head = ' + (input.length ? 'n0' : 'null') + ';';
  return { call: name + '(' + (input.length ? input.join(' → ') : 'null') + ')', setup, hidden: index >= 3 };
}
