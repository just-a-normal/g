# CodingVampire

CodingVampire is a Java-only practice site with 95 original exercises in 19 topics. Each exercise includes three examples, two hidden edge cases, a hint, and a reference solution. Practice runs in the browser, and drafts and solved status are saved on the current origin.

## Run locally

Use Node.js 22.12 or later in the 22.x series, or a newer supported LTS, with npm.

```sh
npm ci
npm start
```

This builds the site and opens it at the local HTTP address printed in the terminal. Open that address if the browser does not launch automatically. The app requires HTTP or HTTPS, so opening an HTML file directly from Finder shows the startup instructions. Use `npm run dev` for live updates while editing the source.

To build and serve the production files separately, run:

```sh
npm run build
npm run preview
```

The deployable files are in `dist/`. Serve them over HTTP or HTTPS with byte-range support for `browser-judge.jar`. The Java runner loads CheerpJ 5.0 and its OpenJDK 17 assets from Leaning Technologies on demand. See [CheerpJ licensing and attribution](https://cheerpj.com/docs/licensing).

## Deploy to GitHub Pages

1. Create an empty GitHub repository named **NAME.github.io** for a user or organization site at **https://NAME.github.io/**. For a project site at **https://NAME.github.io/repo-name/**, name the repository **repo-name** instead. Replace **NAME** with your GitHub account or organization name.
2. Commit the source files, including `.github/workflows/pages.yml`, `package-lock.json`, and `public/browser-judge.jar`. Push the source to GitHub on the `main` branch. The following commands apply to a local checkout that has no `origin` yet.

   ```sh
   git add .
   git commit -m "Build CodingVampire"
   git branch -M main
   git remote add origin https://github.com/NAME/REPOSITORY.git
   git push -u origin main
   ```

3. In the repository, go to **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
4. Go to **Actions → Deploy CodingVampire to Pages → Run workflow**, choose `main`, and start the workflow. Open the URL listed in the `github-pages` deployment environment after it succeeds. Subsequent pushes to `main` rebuild and redeploy automatically.

The same build works at both URL layouts. Vite uses `base: './'` and hash routes survive a page refresh on static hosting. On other static hosts, publish the contents of `dist/` at the desired path. The worker resolves its JAR relative to its own URL.

### Publish within an existing Pages site

If your Pages repository serves a collection of sites from a branch, build CodingVampire with `npm ci` and `npm run build` inside its source directory. Copy the **contents** of `dist/` into the published subdirectory (for example, `cv/` in the Pages source branch). Commit the generated `cv/index.html`, `cv/assets/`, `cv/browser-judge.jar`, `cv/java-worker.js`, and `cv/fangs.svg`. Keep `app.html` as the Vite source template and rebuild after source changes. This keeps the site at paths such as `/g/cv/` and leaves the other sites in the repository in place.

## Practice and progress

The monochrome Classic layout is on by default, with syntax colors in the Java editor. Open **Settings** and turn off **Classic layout** to use the modern design and its light or dark theme. The browser remembers your layout choice.

Press **Go**, **Ctrl+Enter**, or **Cmd+Enter** to compile the method. A run displays expected and actual values, per-case status, and stack traces for visible cases that throw. Hidden cases display a combined result. Since all content is shipped as static files, hidden cases and reference solutions are inspectable in the browser.

The runtime uses OpenJDK's `javax.tools.JavaCompiler` (`javac`) in a dedicated Web Worker to compile a generated `Solution` and `TestRunner` in memory. **Stop** terminates the worker. Execution has a three-second limit after compilation, with separate startup and compilation deadlines. Subsequent runs typically reuse the loaded JVM, and a stopped or timed-out worker is recreated at the next run.

Export downloads a versioned JSON backup of drafts and attempt/solve status. Import merges a backup with local progress, preserves previously solved exercises, and keeps the newer draft for each matching exercise. This also lets you move progress between browsers or sites at different origins.

## Add a Java exercise

The catalog is organized by topic in `problems/`. Add a problem to the relevant topic module, or create a new topic with `topic(id, name, description, difficulty, problems)` and register it in `problems/index.js`. Use stable category slugs and unique Java method names within each category because links and progress IDs use those values.

```js
import { problem, ints } from './schema.js';

const firstPairTotal = problem(
  'int firstPairTotal(int[] nums)',
  'Return the sum of the first two entries. If either is missing, count it as zero.',
  'Check the array length before reading either index.',
  'int total = nums.length > 0 ? nums[0] : 0;\n' +
  'return nums.length > 1 ? total + nums[1] : total;',
  [
    [[ints(8, 4, 99)], 12],
    [[ints(3)], 3],
    [[ints()], 0],
    [[ints(-5, 5)], 0],
    [[ints(2, -6, 1)], -4]
  ]
);
```

| Field | Meaning |
| --- | --- |
| Signature | Java return type, method name, and parameters. The builder adds `public` and supplies the blank method body. |
| Description and hint | Scope, input assumptions, return or mutation contract, and an implementation clue. |
| Reference body | Java placed inside the method. Add private helper methods when needed by supplying explicit `starter` and `solution` values through options. |
| Cases | Each case is `[arguments, expected]`. The first three become visible examples and the rest test edge cases. |
| Values | Supply booleans, numbers, strings, or null directly. Use `ints(...)`, `matrix(...)`, and `list(...)` for containers. Use `expression(java, display)` for typed values such as `42L`, maps, optionals, or custom objects. |
| Options | Optional `difficulty` is `Easy`, `Medium`, or `Hard`. Optional `helpers` is Java source for package-private helper classes. For mutation exercises, override `tests` with entries containing `call`, optional Java `setup` statements, Java expressions `invoke` and `expected`, `expectedDisplay`, and `hidden`. See `moveZeros` in `problems/arrays.js`. |

All exercises have `java.util.*` and `java.util.stream.*` available. Arrays are compared by contents. Lists preserve order and maps use Java map equality.

## Verify and rebuild the judge

With a JDK 17 on your PATH, run:

```sh
npm run verify:java
```

The verifier runs every reference solution against the browser's generated test sources and checks compiler diagnostics, runtime exceptions, and wrong answers. If you change `java/BrowserJudge.java`, run `sh scripts/build-judge.sh` and commit the regenerated JAR. The standard production build uses the bundled JAR and requires only Node.js and npm.

Future topic sets can be added as new level-3 modules or entries using the same schema.
