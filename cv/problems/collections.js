import { problem as p, topic, list as l, expression as e } from './schema.js';

const frequencies = (...entries) => e(
  'Map.ofEntries(' + entries.map(([word, count]) => 'Map.entry(' + JSON.stringify(word) + ', ' + count + ')').join(', ') + ')',
  '{' + entries.map(([word, count]) => JSON.stringify(word) + ': ' + count).join(', ') + '}'
);

export const collections = topic('collections-maps', 'Collections & Maps', 'Lists, frequency maps, sets, and grouped data.', 'Medium', [
  p('List<String> stableUnique(List<String> words)', 'Return a list with duplicates removed, keeping the first occurrence of each case-sensitive value.',
    'LinkedHashSet retains insertion order.',
    'return new ArrayList<>(new LinkedHashSet<>(words));',
    [[[l('b','a','b','c')],l('b','a','c')], [[l('A','a','A')],l('A','a')], [[l()],l()], [[l('','')],l('')], [[l('x','y')],l('x','y')]]),
  p('Map<String, Integer> wordCounts(List<String> words)', 'Count appearances of each case-sensitive string. Include empty strings if present. Map iteration order is unrestricted.',
    'For each word, merge a count of one with Integer::sum.',
    'Map<String,Integer> result = new HashMap<>();\nfor (String word : words) result.merge(word, 1, Integer::sum);\nreturn result;',
    [[[l('sun','rain','sun')],frequencies(['rain',1],['sun',2])], [[l('Go','go')],frequencies(['Go',1],['go',1])], [[l()],frequencies()], [[l('','')],frequencies(['',2])], [[l('z')],frequencies(['z',1])]]),
  p('List<String> sharedWords(List<String> a, List<String> b)', 'Return the unique values appearing in both lists, in the order of their first appearance in a.',
    'Use a set for membership in b and an insertion-ordered set for output.',
    'Set<String> allowed = new HashSet<>(b);\nSet<String> shared = new LinkedHashSet<>();\nfor (String word : a) if (allowed.contains(word)) shared.add(word);\nreturn new ArrayList<>(shared);',
    [[[l('z','a','z','b'),l('b','z')],l('z','b')], [[l('a'),l('A')],l()], [[l('x'),l()],l()], [[l('','a'),l('')],l('')], [[l(),l('z')],l()]]),
  p('List<List<String>> bucketsByLength(List<String> words)', 'Group words by UTF-16 length. Return only nonempty groups in ascending length order, keeping the original order within each group.',
    'Use a TreeMap with lengths as keys and lists as values.',
    'Map<Integer,List<String>> groups = new TreeMap<>();\nfor (String word : words) groups.computeIfAbsent(word.length(), k -> new ArrayList<>()).add(word);\nreturn new ArrayList<>(groups.values());',
    [[[l('bee','up','ant','I')],l(l('I'),l('up'),l('bee','ant'))], [[l('','a','')],l(l('',''),l('a'))], [[l()],l()], [[l('ab','cd','ab')],l(l('ab','cd','ab'))], [[l('long','x')],l(l('x'),l('long'))]]),
  p('String firstUniqueWord(List<String> words)', 'Return the earliest word appearing exactly once, or an empty string if every word repeats.',
    'Count in a map, then scan the original list in order.',
    'Map<String,Integer> counts = new HashMap<>();\nfor (String word : words) counts.merge(word, 1, Integer::sum);\nfor (String word : words) if (counts.get(word) == 1) return word;\nreturn "";',
    [[[l('b','c','b','d')],'c'], [[l('x','x')],''], [[l()],''], [[l('z')],'z'], [[l('a','A','a')],'A']])
]);
