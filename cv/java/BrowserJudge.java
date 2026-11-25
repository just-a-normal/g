package codingvampire;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.FileObject;
import javax.tools.ForwardingJavaFileManager;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.SimpleJavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;

public final class BrowserJudge {
    private static ClassLoader prepared;
    private static List<String> programClasses = List.of();

    public static String compile(String solution, String tests) throws Exception {
        return compileSources(List.of(source("Solution", solution, false), source("TestRunner", tests, false)), false);
    }

    public static String compileProgram(String code) throws Exception {
        return compileSources(List.of(source("Program", code, true)), true);
    }

    private static String compileSources(List<JavaFileObject> sources, boolean sandbox) throws Exception {
        prepared = null;
        programClasses = List.of();
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        if (compiler == null) throw new IllegalStateException("The Java compiler module is unavailable.");

        var diagnostics = new DiagnosticCollector<JavaFileObject>();
        Map<String, ByteArrayOutputStream> bytecode = new TreeMap<>();
        try (StandardJavaFileManager standard = compiler.getStandardFileManager(diagnostics, Locale.ROOT, StandardCharsets.UTF_8);
             var manager = new ForwardingJavaFileManager<StandardJavaFileManager>(standard) {
                 @Override public JavaFileObject getJavaFileForOutput(Location location, String name,
                         JavaFileObject.Kind kind, FileObject sibling) {
                     var bytes = new ByteArrayOutputStream();
                     bytecode.put(name, bytes);
                     return new SimpleJavaFileObject(uri(name, kind), kind) {
                         @Override public OutputStream openOutputStream() {
                             return bytes;
                         }
                     };
                 }
             }) {
            boolean ok = compiler.getTask(null, manager, diagnostics, List.of("-proc:none", "--release", "17"), null, sources).call();
            if (!ok) {
                return diagnostics.getDiagnostics().stream()
                    .filter(item -> item.getKind() == Diagnostic.Kind.ERROR)
                    .limit(20)
                    .map(item -> sandbox ? withPosition(item, item.getLineNumber()) : formatDiagnostic(item))
                    .collect(Collectors.joining("\n"));
            }
        }

        prepared = new ClassLoader(BrowserJudge.class.getClassLoader()) {
            @Override protected Class<?> findClass(String name) throws ClassNotFoundException {
                var bytes = bytecode.get(name);
                if (bytes == null) throw new ClassNotFoundException(name);
                byte[] content = bytes.toByteArray();
                return defineClass(name, content, 0, content.length);
            }
        };
        if (sandbox) programClasses = bytecode.keySet().stream().filter(name -> !name.equals("module-info") && !name.endsWith("package-info")).toList();
        return "";
    }

    public static String run() throws Throwable {
        if (prepared == null) throw new IllegalStateException("Compile the solution first.");
        ClassLoader loader = prepared;
        prepared = null;

        PrintStream previousOut = System.out;
        PrintStream previousErr = System.err;
        try (PrintStream sink = new PrintStream(OutputStream.nullOutputStream())) {
            System.setOut(sink);
            System.setErr(sink);
            try {
                return (String) loader.loadClass("TestRunner").getMethod("run").invoke(null);
            } catch (InvocationTargetException ex) {
                throw ex.getCause();
            } finally {
                System.setOut(previousOut);
                System.setErr(previousErr);
            }
        }
    }

    public static String runProgram(String input) {
        ClassLoader loader = prepared;
        List<String> classes = programClasses;
        prepared = null;
        programClasses = List.of();
        var output = new ByteArrayOutputStream();
        final int limit = 65_536;
        var capped = new OutputStream() {
            boolean truncated;

            @Override public synchronized void write(int value) {
                if (output.size() < limit) output.write(value);
                else truncated = true;
            }

            @Override public synchronized void write(byte[] bytes, int offset, int length) {
                int allowed = Math.min(length, limit - output.size());
                output.write(bytes, offset, allowed);
                if (allowed < length) truncated = true;
            }
        };

        InputStream previousIn = System.in;
        PrintStream previousOut = System.out;
        PrintStream previousErr = System.err;
        String error = "";
        try (var console = new PrintStream(capped, true, StandardCharsets.UTF_8)) {
            System.setIn(new ByteArrayInputStream(input.getBytes(StandardCharsets.UTF_8)));
            System.setOut(console);
            System.setErr(console);
            Method main = findMain(loader, classes);
            if (main == null) {
                error = "Add a public static void main(String[] args) method to run this program.";
            } else {
                main.setAccessible(true);
                main.invoke(null, (Object) new String[0]);
            }
        } catch (Throwable caught) {
            Throwable cause = caught instanceof InvocationTargetException ? caught.getCause() : caught;
            error = cause.toString();
            for (StackTraceElement frame : cause.getStackTrace()) {
                if (frame.getClassName().equals(BrowserJudge.class.getName())) break;
                if (error.length() >= 2000) break;
                error += "\n  at " + frame;
            }
            if (error.length() > 2000) error = error.substring(0, 2000) + "…";
        } finally {
            System.setIn(previousIn);
            System.setOut(previousOut);
            System.setErr(previousErr);
        }
        String text = output.toString(StandardCharsets.UTF_8);
        if (capped.truncated) text += "\n[Output truncated at 64 KiB]";
        if (error.isEmpty()) return "0\n" + text;
        return "1\n" + text + (text.isEmpty() || text.endsWith("\n") ? "" : "\n") + error;
    }

    private static Method findMain(ClassLoader loader, List<String> classes) throws ClassNotFoundException {
        Method first = null;
        for (String name : classes) {
            try {
                Method method = loader.loadClass(name).getDeclaredMethod("main", String[].class);
                int modifiers = method.getModifiers();
                if (!Modifier.isPublic(modifiers) || !Modifier.isStatic(modifiers) || method.getReturnType() != void.class) continue;
                if (name.equals("Main") || name.endsWith(".Main")) return method;
                if (first == null) first = method;
            } catch (NoSuchMethodException ignored) {
                // This type has no entry point.
            }
        }
        return first;
    }

    private static String formatDiagnostic(Diagnostic<? extends JavaFileObject> item) {
        JavaFileObject source = item.getSource();
        if (source != null && source.getName().endsWith("Solution.java")) {
            return withPosition(item, item.getLineNumber() - 3);
        }
        if (source != null && source.getName().endsWith("TestRunner.java")) {
            return "Check the required method signature and return type. " + item.getMessage(Locale.ROOT);
        }
        return item.getMessage(Locale.ROOT);
    }

    private static String withPosition(Diagnostic<? extends JavaFileObject> item, long line) {
        String position = line > 0 ? "Line " + line + ", column " + item.getColumnNumber() + " — " : "";
        return position + item.getMessage(Locale.ROOT);
    }

    private static URI uri(String name, JavaFileObject.Kind kind) {
        return URI.create("mem:///" + name.replace('.', '/') + kind.extension);
    }

    private static JavaFileObject source(String name, String content, boolean flexibleName) {
        return new SimpleJavaFileObject(uri(name, JavaFileObject.Kind.SOURCE), JavaFileObject.Kind.SOURCE) {
            @Override public boolean isNameCompatible(String simpleName, Kind kind) {
                return (flexibleName && kind == Kind.SOURCE && !simpleName.equals("module-info") && !simpleName.equals("package-info"))
                    || super.isNameCompatible(simpleName, kind);
            }

            @Override public CharSequence getCharContent(boolean ignoreEncodingErrors) {
                return content;
            }
        };
    }

    public static void main(String[] folders) throws Throwable {
        for (String folder : folders) {
            Path path = Path.of(folder);
            String error = compile(Files.readString(path.resolve("Solution.java")), Files.readString(path.resolve("TestRunner.java")));
            System.out.println(error.isEmpty() ? run().replace('\n', '|')
                : "C:" + java.util.Base64.getEncoder().encodeToString(error.getBytes(StandardCharsets.UTF_8)));
        }
    }
}
