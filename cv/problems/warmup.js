import { problem as p, topic, ints } from './schema.js';

export const warmup1 = topic('warmup-1', 'Warmup-1', 'Booleans, conditionals, and small integer puzzles.', 'Easy', [
  p('boolean porchLight(boolean dark, boolean motion, boolean manual)', 'Turn the porch light on when manual mode is on, or when it is both dark and motion is detected.', 'Test manual mode independently of the other two conditions.',
    'return manual || (dark && motion);',
    [[[true,true,false],true], [[true,false,false],false], [[false,false,true],true], [[false,true,false],false], [[false,true,true],true]]),
  p('int clampScore(int score)', 'Clamp an integer score to the inclusive range 0 to 100.', 'Apply one lower bound and one upper bound.',
    'return Math.max(0, Math.min(score, 100));',
    [[[-7],0], [[83],83], [[140],100], [[100],100], [[0],0]]),
  p('String gateLabel(int age, boolean member)', 'Return "closed" for ages under 13, "member" for eligible members, and "guest" for everyone else.', 'Check the age requirement before membership.',
    'if (age < 13) return "closed";\nreturn member ? "member" : "guest";',
    [[[12,true],'closed'], [[13,true],'member'], [[20,false],'guest'], [[13,false],'guest'], [[0,false],'closed']]),
  p('boolean sameSide(int a, int b)', 'Return true if both integers are strictly positive or both are strictly negative. Zero has no side.', 'Compare each number directly with zero to avoid overflow.',
    'return (a > 0 && b > 0) || (a < 0 && b < 0);',
    [[[2,9],true], [[-1,-8],true], [[0,0],false], [[-2147483648,2147483647],false], [[0,-1],false]]),
  p('int medianOfThree(int a, int b, int c)', 'Return the middle value when the three integers are placed in ascending order. Duplicate values count individually.', 'Clamp c between the smaller and larger of a and b.',
    'return Math.max(Math.min(a, b), Math.min(Math.max(a, b), c));',
    [[[9,2,4],4], [[3,3,8],3], [[-7,0,-2],-2], [[2147483647,-2147483648,0],0], [[4,4,4],4]])
]);

export const warmup2 = topic('warmup-2', 'Warmup-2', 'Loops over strings and arrays, with running totals.', 'Easy', [
  p('int countSteps(int[] steps, int threshold)', 'Count entries strictly greater than threshold. An empty array has count zero.', 'Increment a counter inside an enhanced for loop.',
    'int count = 0;\nfor (int step : steps) if (step > threshold) count++;\nreturn count;',
    [[[ints(1,6,4,8),4],2], [[ints(),4],0], [[ints(-4,-1,-3),-4],2], [[ints(5,5),5],0], [[ints(7,7),6],2]]),
  p('String everyThird(String text)', 'Keep the UTF-16 characters at indices 0, 3, 6, and so on, in order.', 'Start at zero and advance the index by three.',
    'StringBuilder out = new StringBuilder();\nfor (int i = 0; i < text.length(); i += 3) out.append(text.charAt(i));\nreturn out.toString();',
    [[['abcdefg'],'adg'], [['Java'],'Ja'], [[''],''], [['abc'],'a'], [['a b c d e'],'a d']]),
  p('int adjacentDrops(int[] levels)', 'Count pairs of consecutive entries where the second value is strictly lower than the first.', 'Start at index 1 and compare with the previous entry.',
    'int drops = 0;\nfor (int i = 1; i < levels.length; i++) if (levels[i] < levels[i - 1]) drops++;\nreturn drops;',
    [[[ints(4,2,7,1)],2], [[ints(2,2,3)],0], [[ints(9,8,7)],2], [[ints()],0], [[ints(-1)],0]]),
  p('int digitTotal(String text)', 'Sum the values of ASCII digits 0–9 in text, ignoring other characters.', 'Subtract the character literal \'0\' from a digit.',
    "int sum = 0;\nfor (char c : text.toCharArray()) if (c >= '0' && c <= '9') sum += c - '0';\nreturn sum;",
    [[['a3b5'],8], [['12-03'],6], [['none'],0], [['9٠９'],9], [[''],0]]),
  p('int firstRepeat(int[] values)', 'Return the index of the second entry in the first equal adjacent pair. Return -1 if there is no pair.', 'Return immediately when two neighbors match.',
    'for (int i = 1; i < values.length; i++) if (values[i] == values[i - 1]) return i;\nreturn -1;',
    [[[ints(4,7,7,2,2)],2], [[ints(6,6,6)],1], [[ints(7,8,7)],-1], [[ints()],-1], [[ints(0,0)],1]])
]);
