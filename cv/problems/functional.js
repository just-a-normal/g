import { problem as p, topic, list as l } from './schema.js';

export const functional1 = topic('functional-1', 'Functional-1', 'Map and transform lists with concise Java lambdas.', 'Easy', [
  p('List<Integer> addOffset(List<Integer> nums, int offset)', 'Return the numbers with offset added to each element. Keep their order. Sums fit in int.',
    'List.replaceAll takes a function from each element to its replacement.',
    'nums.replaceAll(n -> n + offset);\nreturn nums;',
    [[[l(1,3,9),4],l(5,7,13)], [[l(-4,0),-1],l(-5,-1)], [[l(),8],l()], [[l(5),0],l(5)], [[l(2,2),3],l(5,5)]]),
  p('List<String> bracketWords(List<String> words)', 'Wrap each string in angle brackets. Keep the order and include an empty pair for an empty string.',
    'Make the replacement lambda concatenate the two brackets.',
    'words.replaceAll(w -> "<" + w + ">");\nreturn words;',
    [[[l('hi','go')],l('<hi>','<go>')], [[l('')],l('<>')], [[l()],l()], [[l('<x>')],l('<<x>>')], [[l(' A ','!')],l('< A >','<!>')]]),
  p('List<Integer> nonnegativeRemainders(List<Integer> nums, int divisor)', 'Replace each integer with its nonnegative remainder for the positive divisor. Preserve order.',
    'Math.floorMod handles negative values.',
    'nums.replaceAll(n -> Math.floorMod(n, divisor));\nreturn nums;',
    [[[l(-4,4,11),5],l(1,4,1)], [[l(-9,0),3],l(0,0)], [[l(),4],l()], [[l(-2147483648),3],l(1)], [[l(5,7),1],l(0,0)]]),
  p('List<String> trimToWidth(List<String> words, int width)', 'Truncate each string to at most width UTF-16 code units, preserving list order. Width is nonnegative.',
    'Use the smaller of the string length and width as the substring endpoint.',
    'words.replaceAll(w -> w.substring(0, Math.min(w.length(), width)));\nreturn words;',
    [[[l('planet','go'),3],l('pla','go')], [[l('a',''),0],l('','')], [[l(),9],l()], [[l('cat'),3],l('cat')], [[l('','zip'),1],l('','z')]]),
  p('List<String> signedLabels(List<Integer> nums)', 'Format each positive value with a leading plus sign. Format zero and negative values normally. Keep the order.',
    'Map each integer to a String and collect the stream.',
    'return nums.stream().map(n -> n > 0 ? "+" + n : n.toString()).collect(Collectors.toList());',
    [[[l(-2,0,9)],l('-2','0','+9')], [[l(1,12)],l('+1','+12')], [[l()],l()], [[l(-2147483648)],l('-2147483648')], [[l(0,0)],l('0','0')]])
]);

export const functional2 = topic('functional-2', 'Functional-2', 'Filter, transform, and combine list operations.', 'Medium', [
  p('List<Integer> squareOdds(List<Integer> nums)', 'Keep only odd integers and square them, preserving input order. All squared values fit in int.',
    'Negative odd numbers also have a nonzero remainder modulo 2.',
    'return nums.stream().filter(n -> n % 2 != 0).map(n -> n * n).collect(Collectors.toList());',
    [[[l(2,3,-5,4)],l(9,25)], [[l(0,8)],l()], [[l(1,-1)],l(1,1)], [[l()],l()], [[l(-3,7)],l(9,49)]]),
  p('List<String> cleanLabels(List<String> words)', 'Trim each string using String.trim(), drop empty results, and uppercase the rest with Locale.ROOT. Preserve order.',
    'Map to trimmed strings before deciding what to filter.',
    'return words.stream().map(String::trim).filter(w -> !w.isEmpty())\n    .map(w -> w.toUpperCase(Locale.ROOT)).collect(Collectors.toList());',
    [[[l(' sky ',' ','sea')],l('SKY','SEA')], [[l('','\t')],l()], [[l('Java','JAVA')],l('JAVA','JAVA')], [[l()],l()], [[l('i',' ß ')],l('I','SS')]]),
  p('List<String> removeTagged(List<String> words, String tag)', 'Return only the words that do not begin with the case-sensitive tag. Preserve order. An empty tag matches every word.',
    'Negate startsWith in your filter or remove matching entries with removeIf.',
    'words.removeIf(w -> w.startsWith(tag));\nreturn words;',
    [[[l('x-a','a-x','x-b'),'x-'],l('a-x')], [[l('a','b'),''],l()], [[l('AA','aa'),'a'],l('AA')], [[l(),'x'],l()], [[l('','bad'),'b'],l('')]]),
  p('List<Integer> boundedTriples(List<Integer> nums, int limit)', 'Triple each number, then keep only the resulting values with absolute value at most the nonnegative limit. Keep order.',
    'Widen to long before tripling, and cast only the values that pass the filter.',
    'return nums.stream().map(n -> 3L * n).filter(n -> Math.abs(n) <= limit)\n    .map(Long::intValue).collect(Collectors.toList());',
    [[[l(-3,0,2,4),9],l(-9,0,6)], [[l(-2,2),5],l()], [[l(0,1),0],l(0)], [[l(2147483647,-2147483648,2),2147483647],l(6)], [[l(),8],l()]]),
  p('List<String> uniqueKeys(List<String> words)', 'Trim and lowercase strings with Locale.ROOT, drop empty strings, and keep only the first occurrence of each normalized value.',
    'Stream.distinct preserves encounter order on a list stream.',
    'return words.stream().map(w -> w.trim().toLowerCase(Locale.ROOT))\n    .filter(w -> !w.isEmpty()).distinct().collect(Collectors.toList());',
    [[[l(' A ','b','a',' B ')],l('a','b')], [[l(' ','')],l()], [[l('C','b','a','c')],l('c','b','a')], [[l()],l()], [[l('I','i','i i')],l('i','i i')]])
]);
