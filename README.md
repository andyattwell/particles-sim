# Particle collition simulator

Constructed in JS, using canvas and request frame animation to visualize particles interactions.

Change te parameter to see how the particles behave.

Save parameter sets as profiles to rapidly compare between diferent configurations

### Built With

* [![Bootstrap][Bootstrap.com]][Bootstrap-url]
* [![Javascript][Javascript.com]][Bootstrap-url]
* [![Vue][Vue.js]][Vue-url]

This template should help get you started developing with Vue 3 in Vite.

## TODO
- Alpha particles
    - Stronger attraction
    - Competes with other alphas
- Damage by collition?
    - The particles die
    - Cometition?
- Diferent types of particles
    - Diferent types of interactions
- Other types of objects with collition
- Player
    - Control with keyboard

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[Javascript.com]: https://img.shields.io/badge/JavaScript-ES6-yellow?logo=javascript
[Javascript-url]: https://getbootstrap.com

[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-5.3.2-7952B3?logo=bootstrap
[Bootstrap-url]: https://getbootstrap.com

[Vue.js]: https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js
[Vue-url]: https://vuejs.org/