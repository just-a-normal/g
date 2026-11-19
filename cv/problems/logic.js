import { problem as p, topic } from './schema.js';

export const logic1 = topic('logic-1', 'Logic-1', 'Boolean rules, bounds, and decisions with multiple inputs.', 'Easy', [
  p('boolean exactlyTwo(boolean a, boolean b, boolean c)', 'Return true exactly when two of the three flags are true.',
    'Turn each boolean into 1 or 0 and add.',
    'return (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0) == 2;',
    [[[true,true,false],true], [[true,true,true],false], [[false,true,false],false], [[false,true,true],true], [[false,false,false],false]]),
  p('boolean overlaps(int aStart, int aEnd, int bStart, int bEnd)', 'Check if two half-open intervals [start, end) share any time. An interval with equal start and end is empty. Starts never exceed ends.',
    'Compare the later start with the earlier end.',
    'return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);',
    [[[1,5,4,8],true], [[1,5,5,9],false], [[1,1,0,3],false], [[-5,3,-2,1],true], [[5,8,1,3],false]]),
  p('String fizzLabel(int n)', 'Return "both" for multiples of 3 and 5, "three" for only 3, "five" for only 5, and "plain" otherwise. Zero counts as a multiple of both.',
    'Check the combined condition before either individual one.',
    'if (n % 15 == 0) return "both";\nif (n % 3 == 0) return "three";\nreturn n % 5 == 0 ? "five" : "plain";',
    [[[15],'both'], [[10],'five'], [[7],'plain'], [[-3],'three'], [[0],'both']]),
  p('int ticketBand(int speed, boolean emergency)', 'Return 0 at speeds up to 55, 1 for 56 through 75, and 2 for higher speeds. An emergency gives a 10 mph allowance on both limits.',
    'Increase each threshold before testing speed.',
    'int allowance = emergency ? 10 : 0;\nif (speed <= 55 + allowance) return 0;\nreturn speed <= 75 + allowance ? 1 : 2;',
    [[[56,false],1], [[65,true],0], [[86,true],2], [[85,true],1], [[75,false],1]]),
  p('boolean nearOne(int value, int left, int right)', 'Return true if value is within distance 2 of exactly one of left and right. Distance 2 is included.',
    'Use a long difference and exclusive OR on the two checks.',
    'return (Math.abs((long) value - left) <= 2) ^ (Math.abs((long) value - right) <= 2);',
    [[[5,3,10],true], [[5,3,7],false], [[5,1,9],false], [[-2147483648,2147483647,-2147483646],true], [[0,0,0],false]])
]);

export const logic2 = topic('logic-2', 'Logic-2', 'Modulo arithmetic and boundary-heavy reasoning.', 'Medium', [
  p('int nextMultiple(int number, int step)', 'Return the smallest multiple of positive step that is at least number. Inputs may be negative and the answer fits in int.',
    'Use floorMod to get a nonnegative remainder.',
    'int remainder = Math.floorMod(number, step);\nreturn remainder == 0 ? number : number + (step - remainder);',
    [[[13,5],15], [[-7,5],-5], [[20,10],20], [[-1,2],0], [[0,19],0]]),
  p('int clockGap(int from, int to)', 'Given two hours in 0 through 23, return the elapsed hours moving forward from from to to. Equal hours yield 0.',
    'A negative difference wraps forward by 24.',
    'return Math.floorMod(to - from, 24);',
    [[[22,3],5], [[8,17],9], [[12,12],0], [[23,0],1], [[0,23],23]]),
  p('boolean buildExact(int ones, int fives, int target)', 'Determine whether a nonnegative target can be made with at most ones 1-unit pieces and fives 5-unit pieces.',
    'Use as many 5-unit pieces as fit, then test the leftover.',
    'int usedFives = Math.min(fives, target / 5);\nreturn target - usedFives * 5 <= ones;',
    [[[3,2,13],true], [[1,9,14],false], [[7,1,12],true], [[0,0,0],true], [[0,4,21],false]]),
  p('boolean formsTriangle(int a, int b, int c)', 'Check if the three integer lengths can form a nondegenerate triangle. Sides must be positive.',
    'Make additions in long to avoid overflow.',
    'return a > 0 && b > 0 && c > 0 && (long) a + b > c && (long) b + c > a && (long) a + c > b;',
    [[[3,4,5],true], [[2,3,5],false], [[0,4,4],false], [[2147483647,2147483647,2147483647],true], [[4,2,-3],false]]),
  p('int roundToStep(int n, int step)', 'Round a nonnegative integer to the closest multiple of positive step. On a tie round up. The answer fits in int.',
    'Compare the distance to the lower multiple against the distance to the upper one.',
    'int rem = n % step;\nreturn rem >= step - rem ? n + (step - rem) : n - rem;',
    [[[14,10],10], [[15,10],20], [[8,3],9], [[0,5],0], [[2147483647,2147483647],2147483647]])
]);
