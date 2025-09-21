# Deno FFI Symbol Generator

Generate foreign function interfaces for Deno. This is an early version, and is still in development, so may generate
incorrect bindings; always check the output!

## Usage

```ts
import * as Ffi from "@zerm/ffigen";

import Writer = Ffi.Writer;
import parse = Ffi.Symbol.parse;

const w = new Writer();

w.preamble({ export: "symbols", paths: { types: "./types.ts" } });

w.addSymbol(parse(
    "void InitWindow(int width, int height, const char *title); // Initialize window and OpenGL context",
));

w.addSymbol(parse(
    "void SetWindowIcons(Image *images, int count); // Set icon for window (multiple images, RGBA 32bit)",
));

w.addSymbol(parse(
    "Color *LoadImageColors(Image image); // Load color data from image as a Color array",
));

// more symbols...

w.end();

Deno.writeTextFileSync("./symbols.ts", w.output);
w.reset();
```

The output will be written to `symbols.ts`:

```ts
// symbols.ts

import * as Types from "./types.ts";

export const symbols = {
    /** Initialize window and OpenGL context */
    initWindow: {
        name: "InitWindow",
        parameters: [
            "i32", // <int> width
            "i32", // <int> height
            "buffer", // <const char *> title
        ],
        result: "void", // <void>
        optional: false,
        nonblocking: false,
    },

    /** Set icon for window (multiple images, RGBA 32bit) */
    setWindowIcons: {
        name: "SetWindowIcons",
        parameters: [
            "pointer", // <Image *> images
            "i32", // <int> count
        ],
        result: "void", // <void>
        optional: false,
        nonblocking: false,
    },

    /** Load color data from image as a Color array */
    loadImageColors: {
        name: "LoadImageColors",
        parameters: [
            Types.Image, // <Image> image
        ],
        result: "pointer", // <Color *>
        optional: false,
        nonblocking: false,
    },
} as const satisfies Deno.ForeignLibraryInterface;
```

## Limitations

- Does not support variadic parameters.

## Quirks

- Prefix `?` to make a symbol optional.
- Prefix `!` to make a symbol non-blocking (can be combined AFTER `?`).
- Remove any calling conventions.
- Define custom types in your configured `paths.types` file:

### Example

<!-- ```ts
// types.ts

/** Color, 4 components, R8G8B8A8 (32bit) */
export const Color = [
    "u8", // Color red value
    "u8", // Color green value
    "u8", // Color blue value
    "u8", // Color alpha value
] as const satisfies readonly Deno.NativeType[];
``` -->

```ts
// types.ts

/** Color, 4 components, R8G8B8A8 (32bit) */
export const Color = {
    struct: [
        "u8", // Color red value
        "u8", // Color green value
        "u8", // Color blue value
        "u8", // Color alpha value
    ],
} as const satisfies Deno.NativeType;

/** Logging: Redirect trace log messages */
export const TraceLogCallback = "function" as const satisfies Deno.NativeType;

// more types...
```
