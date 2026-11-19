package codingvampire;

import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.io.PrintStream;
import java.lang.reflect.InvocationTargetException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
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

    public static String compile(String solution, String tests) throws Exception {
        prepared = null;
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        if (compiler == null) throw new IllegalStateException("The Java compiler module is unavailable.");

        var diagnostics = new DiagnosticCollector<JavaFileObject>();
        Map<String, ByteArrayOutputStream> bytecode = new HashMap<>();
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
            boolean ok = compiler.getTask(null, manager, diagnostics, List.of("-proc:none", "--release", "17"), null,
                List.of(source("Solution", solution), source("TestRunner", tests))).call();
            if (!ok) {
                return diagnostics.getDiagnostics().stream()
                    .filter(item -> item.getKind() == Diagnostic.Kind.ERROR)
                    .limit(20)
                    .map(BrowserJudge::formatDiagnostic)
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

    private static String formatDiagnostic(Diagnostic<? extends JavaFileObject> item) {
        JavaFileObject source = item.getSource();
        if (source != null && source.getName().endsWith("Solution.java")) {
            long line = item.getLineNumber() - 3;
            String position = line > 0 ? "Line " + line + ", column " + item.getColumnNumber() + " — " : "";
            return position + item.getMessage(Locale.ROOT);
        }
        if (source != null && source.getName().endsWith("TestRunner.java")) {
            return "Check the required method signature and return type. " + item.getMessage(Locale.ROOT);
        }
        return item.getMessage(Locale.ROOT);
    }

    private static URI uri(String name, JavaFileObject.Kind kind) {
        return URI.create("mem:///" + name.replace('.', '/') + kind.extension);
    }

    private static JavaFileObject source(String name, String content) {
        return new SimpleJavaFileObject(uri(name, JavaFileObject.Kind.SOURCE), JavaFileObject.Kind.SOURCE) {
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
