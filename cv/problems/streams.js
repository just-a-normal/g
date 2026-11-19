import { problem as p, topic, list as l, expression as e } from './schema.js';

const optional = value => value === undefined
  ? e('Optional.empty()', 'Optional.empty')
  : e('Optional.of(' + JSON.stringify(value) + ')', 'Optional[' + JSON.stringify(value) + ']');

export const streams = topic('streams', 'Functional Java / Streams', 'Stream pipelines, reductions, and Optional.', 'Hard', [
  p('Optional<String> firstMatching(List<String> words, String prefix)', 'Return the first word that starts with the case-sensitive prefix as an Optional. Return an empty Optional when no word matches.',
    'Filter, then use findFirst.',
    'return words.stream().filter(w -> w.startsWith(prefix)).findFirst();',
    [[[l('blue','black','red'),'bl'],optional('blue')], [[l('red'),'rE'],optional()], [[l(),''],optional()], [[l('','a'),''],optional('')], [[l('a','b'),'b'],optional('b')]]),
  p('long sumPositiveSquares(List<Integer> nums)', 'Sum the squares of strictly positive integers using a stream. The result fits in long.',
    'Transform each value to long before multiplication.',
    'return nums.stream().filter(n -> n > 0).mapToLong(n -> (long) n * n).sum();',
    [[[l(-4,3,2)],e('13L','13')], [[l(0,-1)],e('0L','0')], [[l(50000)],e('2500000000L','2500000000')], [[l()],e('0L','0')], [[l(1,1,1)],e('3L','3')]]),
  p('List<Integer> flattenDistinct(List<List<Integer>> groups)', 'Flatten the sublists in encounter order and keep only the first instance of each value.',
    'Use flatMap with List::stream and then distinct.',
    'return groups.stream().flatMap(List::stream).distinct().collect(Collectors.toList());',
    [[[l(l(3,1),l(1,2))],l(3,1,2)], [[l(l(),l(7))],l(7)], [[l()],l()], [[l(l(-1),l(-1))],l(-1)], [[l(l(),l())],l()]]),
  p('String joinLongWords(List<String> words, int min)', 'Take words with UTF-16 length at least min, sort them in natural string order, and join them with " / ". Keep duplicates.',
    'Collectors.joining inserts a separator only between elements.',
    'return words.stream().filter(w -> w.length() >= min).sorted().collect(Collectors.joining(" / "));',
    [[[l('pear','fig','apple'),4],'apple / pear'], [[l('ab','xy'),3],''], [[l('b','A','b'),1],'A / b / b'], [[l(),0],''], [[l('one'),3],'one']]),
  p('int longestWordSize(List<String> words)', 'Return the longest UTF-16 string length, or 0 when the list is empty. Use a stream reduction.',
    'IntStream.max returns an OptionalInt.',
    'return words.stream().mapToInt(String::length).max().orElse(0);',
    [[[l('tea','coffee','')],6], [[l()],0], [[l('','')],0], [[l('🍵')],2], [[l('a','b')],1]])
]);
