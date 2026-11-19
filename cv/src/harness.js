const imports = 'import java.util.*;\nimport java.util.stream.*;\n';

export function buildSources(problem, code) {
  const methods = problem.tests.map((test, index) => `
    private static String case${index}() {
        try {
            ${test.setup || ''}
            Object actual = ${test.invoke};
            Object expected = ${test.expected};
            return row(Objects.deepEquals(expected, actual) ? "OK" : "X", format(actual));
        } catch (Throwable error) {
            return failure(error);
        }
    }`).join('\n');
  const rows = problem.tests.map((_, i) => 'case' + i + '()').join(', ');

  return {
    solution: imports + 'public class Solution {\n' + code + '\n}\n' + (problem.helpers || ''),
    tests: imports + String.raw`
public class TestRunner {
    public static String run() {
        return String.join("\n", ${rows});
    }
    ${methods}

    private static String row(String status, String detail) {
        String limited = detail.length() > 1600 ? detail.substring(0, 1600) + "…" : detail;
        return status + ":" + Base64.getEncoder().encodeToString(limited.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    private static String failure(Throwable error) {
        StringBuilder message = new StringBuilder(error.toString());
        int count = 0;
        for (StackTraceElement frame : error.getStackTrace()) {
            if (count++ == 10) break;
            if (frame.getClassName().equals("TestRunner")) break;
            if (frame.getClassName().equals("Solution")) {
                message.append("\n  at ").append(frame.getMethodName());
                if (frame.getLineNumber() > 3) message.append(" (line ").append(frame.getLineNumber() - 3).append(")");
            } else {
                message.append("\n  at ").append(frame);
            }
        }
        return row("E", message.toString());
    }

    private static String format(Object value) {
        if (value == null) return "null";
        if (value instanceof String) {
            return "\"" + ((String) value).replace("\\", "\\\\").replace("\"", "\\\"")
                .replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t")
                .replace("\b", "\\b").replace("\f", "\\f") + "\"";
        }
        if (value.getClass().isArray()) {
            StringJoiner parts = new StringJoiner(", ", "[", "]");
            int length = java.lang.reflect.Array.getLength(value);
            for (int i = 0; i < Math.min(length, 80); i++) parts.add(format(java.lang.reflect.Array.get(value, i)));
            if (length > 80) parts.add("…");
            return parts.toString();
        }
        if (value instanceof Collection<?>) {
            return ((Collection<?>) value).stream().limit(80).map(TestRunner::format)
                .collect(Collectors.joining(", ", "[", ((Collection<?>) value).size() > 80 ? ", …]" : "]"));
        }
        if (value instanceof Map<?, ?>) {
            return ((Map<?, ?>) value).entrySet().stream().limit(80)
                .map(entry -> format(entry.getKey()) + ": " + format(entry.getValue()))
                .collect(Collectors.joining(", ", "{", ((Map<?, ?>) value).size() > 80 ? ", …}" : "}"));
        }
        if (value instanceof Optional<?>) {
            return ((Optional<?>) value).map(item -> "Optional[" + format(item) + "]").orElse("Optional.empty");
        }
        return String.valueOf(value);
    }
}
`
  };
}

export function readResults(output) {
  return output.split('\n').map(row => {
    const separator = row.indexOf(':');
    const status = row.slice(0, separator);
    if (separator < 0 || !['OK', 'X', 'E'].includes(status)) throw new Error('Invalid Java test result.');
    const bytes = Uint8Array.from(atob(row.slice(separator + 1)), ch => ch.charCodeAt(0));
    return { status, detail: new TextDecoder().decode(bytes) };
  });
}
