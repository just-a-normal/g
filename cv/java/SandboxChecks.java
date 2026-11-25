import codingvampire.BrowserJudge;

class SandboxChecks {
    public static void main(String[] args) throws Exception {
        check("", BrowserJudge.compileProgram("""
            package practice;
            public record Greeting() {
                public static void main(String[] args) {
                    System.out.println(new java.util.Scanner(System.in).nextLine());
                    System.err.println("stderr");
                }
            }
            """));
        check("0\nhello\nstderr\n", BrowserJudge.runProgram("hello\n"));

        check("", BrowserJudge.compileProgram("""
            class Alpha {
                public static void main(String[] args) { throw new AssertionError(); }
            }
            class Main {
                public static void main(String[] args) {
                    System.out.println("Before");
                    throw new IllegalArgumentException("example");
                }
            }
            """));
        String failure = BrowserJudge.runProgram("");
        if (!failure.startsWith("1\nBefore\njava.lang.IllegalArgumentException: example")) {
            throw new AssertionError(failure);
        }

        check("", BrowserJudge.compileProgram("class Empty {}"));
        check("1\nAdd a public static void main(String[] args) method to run this program.", BrowserJudge.runProgram(""));

        String diagnostic = BrowserJudge.compileProgram("class Main {\n    int number = ;\n}");
        if (!diagnostic.startsWith("Line 2, column ")) throw new AssertionError(diagnostic);

        check("", BrowserJudge.compileProgram("""
            class Main {
                public static void main(String[] args) {
                    System.out.print("x".repeat(70_000));
                }
            }
            """));
        check("0\n" + "x".repeat(65_536) + "\n[Output truncated at 64 KiB]", BrowserJudge.runProgram(""));
        System.out.println("Verified sandbox entry points, input, output, diagnostics, and output limits.");
    }

    private static void check(String expected, String actual) {
        if (!expected.equals(actual)) throw new AssertionError(actual.substring(0, Math.min(250, actual.length())));
    }
}
