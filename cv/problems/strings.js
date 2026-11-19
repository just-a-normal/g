import { problem as p, topic } from './schema.js';

export const string1 = topic('string-1', 'String-1', 'Slices, prefixes, and small string transformations.', 'Easy', [
  p('String wrapNote(String note)', 'Put one pair of square brackets around note. Keep the content exactly as supplied.',
    'Concatenate three strings.', 'return "[" + note + "]";',
    [[['hello'],'[hello]'], [[''],'[]'], [['[a]'],'[[a]]'], [[' x '],'[ x ]'], [['\n'],'[\n]']]),
  p('String swapEdges(String text)', 'Exchange the first and last characters of an ASCII string. Return strings shorter than two characters unchanged.',
    'Keep the middle substring between the two exchanged characters.',
    'int n = text.length();\nif (n < 2) return text;\nreturn text.charAt(n - 1) + text.substring(1, n - 1) + text.charAt(0);',
    [[['climb'],'blimc'], [['ab'],'ba'], [['a'],'a'], [[''],''], [['aba'],'aba']]),
  p('String tailAfterSlash(String path)', 'Return the text following the last slash. If no slash appears, return the full string.',
    'The index returned by lastIndexOf is -1 when absent.',
    "return path.substring(path.lastIndexOf('/') + 1);",
    [[['src/main/App.java'],'App.java'], [['readme'],'readme'], [['photos/'],''], [['/'],''], [[''],'']]),
  p('boolean pairedTags(String text)', 'Return true if text begins with "<b>" and ends with "</b>". The contents may be empty.',
    'Use one prefix check and one suffix check.',
    'return text.startsWith("<b>") && text.endsWith("</b>");',
    [[['<b>hi</b>'],true], [['<b></b>'],true], [['<i>hi</b>'],false], [['<b>hi</b> '],false], [[''],false]]),
  p('String centerSlice(String text)', 'For an ASCII string with odd length, return its middle character. For a nonempty string with even length, return its two middle characters. Return empty for empty.',
    'Use length / 2 to find the right middle position.',
    'int n = text.length(), mid = n / 2;\nif (n == 0) return text;\nreturn text.substring(mid - (n % 2 == 0 ? 1 : 0), mid + 1);',
    [[['planet'],'an'], [['misty'],'s'], [[''],''], [['ab'],'ab'], [['x'],'x']])
]);

export const string2 = topic('string-2', 'String-2', 'Character loops, parsing, and StringBuilder.', 'Medium', [
  p('String compactRuns(String text)', 'Keep only the first character in each run of identical ASCII characters.',
    'Append the first character and every character different from its predecessor.',
    'StringBuilder out = new StringBuilder();\nfor (int i = 0; i < text.length(); i++) {\n    if (i == 0 || text.charAt(i) != text.charAt(i - 1)) out.append(text.charAt(i));\n}\nreturn out.toString();',
    [[['baaalloon'],'balon'], [['AAaa'],'Aa'], [[''],''], [['aabaa'],'aba'], [[' '],' ']]),
  p('int countOverlaps(String text, String token)', 'Count every starting index where token matches text, including overlaps. Return 0 for an empty token.',
    'Use startsWith(token, index), advancing by one each time.',
    'if (token.isEmpty()) return 0;\nint count = 0;\nfor (int i = 0; i <= text.length() - token.length(); i++) if (text.startsWith(token, i)) count++;\nreturn count;',
    [[['aaaa','aa'],3], [['banana','ana'],2], [['abc',''],0], [['','a'],0], [['same','same'],1]]),
  p('String maskDigits(String text)', 'Replace each ASCII digit with "#", except the last two digits in the string. Leave all other characters in place.',
    'Scan from the end and count digits as you encounter them.',
    "StringBuilder out = new StringBuilder(text);\nint count = 0;\nfor (int i = text.length() - 1; i >= 0; i--) {\n    char c = text.charAt(i);\n    if (c >= '0' && c <= '9' && ++count > 2) out.setCharAt(i, '#');\n}\nreturn out.toString();",
    [[['code 12-34'],'code ##-34'], [['a1b2'],'a1b2'], [['123'],'#23'], [['no digits'],'no digits'], [['1９2٣3'],'#９2٣3']]),
  p('int sumFields(String text)', 'Split text on commas. Trim each field, ignore empty fields, and sum the remaining signed decimal integers. All values and the total fit in int.',
    'Trim before checking if the field is empty.',
    'int sum = 0;\nfor (String field : text.split(",")) {\n    String value = field.trim();\n    if (!value.isEmpty()) sum += Integer.parseInt(value);\n}\nreturn sum;',
    [[['1, 2, -5'],-2], [[' ,,4,'],4], [[''],0], [[',-2,+2,'],0], [['12'],12]]),
  p('String alternateWeave(String a, String b)', 'Take one ASCII character from a, then one from b, and repeat. Append characters from whichever string has any left.',
    'Use a loop up to the longer length and check both bounds.',
    'StringBuilder out = new StringBuilder();\nfor (int i = 0; i < Math.max(a.length(), b.length()); i++) {\n    if (i < a.length()) out.append(a.charAt(i));\n    if (i < b.length()) out.append(b.charAt(i));\n}\nreturn out.toString();',
    [[['abc','XY'],'aXbYc'], [['u','123'],'u123'], [['','ok'],'ok'], [['hey',''],'hey'], [['',''],'']])
]);

export const string3 = topic('string-3', 'String-3', 'Regular expressions, tokenization, and text algorithms.', 'Hard', [
  p('String slugify(String text)', 'Lowercase with Locale.ROOT, replace each run of non-ASCII-alphanumeric characters with one hyphen, and remove hyphens at the ends.',
    'After lowercasing, a negated character class can match separators.',
    'return text.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");',
    [[['  Hello, Java 8! '],'hello-java-8'], [['a___b'],'a-b'], [['!!!'],''], [['Café Déjà-vu'],'caf-d-j-vu'], [['FOO'],'foo']]),
  p('boolean validHexColor(String text)', 'Return true only if text is "#" followed by exactly three or six ASCII hexadecimal digits.',
    'Use matches with two allowed lengths.',
    'return text.matches("#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})");',
    [[['#a0F'],true], [['#123ABC'],true], [['#1234'],false], [['123abc'],false], [['#12z'],false]]),
  p('String encodeRuns(String text)', 'Encode each consecutive run of lowercase ASCII letters as its letter followed by the decimal run length, including runs of length one.',
    'Advance a second index until the current run ends.',
    'StringBuilder out = new StringBuilder();\nfor (int i = 0; i < text.length();) {\n    int end = i + 1;\n    while (end < text.length() && text.charAt(end) == text.charAt(i)) end++;\n    out.append(text.charAt(i)).append(end - i);\n    i = end;\n}\nreturn out.toString();',
    [[['aaabcca'],'a3b1c2a1'], [['abc'],'a1b1c1'], [[''],''], [['aaaaaaaaaaa'],'a11'], [['aba'],'a1b1a1']]),
  p('String longestAsciiWord(String text)', 'Find the longest run of ASCII letters, returning the first in a tie. Preserve its case and return empty when there are no letters.',
    'Split on one or more characters outside the ASCII letter range.',
    'String best = "";\nfor (String word : text.split("[^A-Za-z]+")) if (word.length() > best.length()) best = word;\nreturn best;',
    [[['we code in Java!'],'code'], [['1-HELLO_world'],'HELLO'], [['123'],''], [['éabcxyz'],'abcxyz'], [['abcD'],'abcD']]),
  p('String commonPrefix(String[] words)', 'Return the longest case-sensitive prefix common to all words. Return empty for an empty array.',
    'Start with the first word and shorten the candidate as needed.',
    'if (words.length == 0) return "";\nString prefix = words[0];\nfor (String word : words) {\n    while (!word.startsWith(prefix)) prefix = prefix.substring(0, prefix.length() - 1);\n}\nreturn prefix;',
    [
      [[{java:'new String[]{"flower","flow","flight"}',display:'["flower", "flow", "flight"]'}],'fl'],
      [[{java:'new String[]{"Java","java"}',display:'["Java", "java"]'}],''],
      [[{java:'new String[0]',display:'[]'}],''],
      [[{java:'new String[]{"alone"}',display:'["alone"]'}],'alone'],
      [[{java:'new String[]{"same","","same"}',display:'["same", "", "same"]'}],'']
    ])
]);
