declare module "react/jsx-runtime" {
  export namespace JSX {
    type Element = any;
    interface ElementClass {}
    interface ElementAttributesProperty {
      props: Record<string, unknown>;
    }
    interface IntrinsicElements {
      [elemName: string]: unknown;
    }
  }

  export const Fragment: unique symbol;
  export function jsx(type: unknown, props: unknown, key?: unknown): any;
  export function jsxs(type: unknown, props: unknown, key?: unknown): any;
}
