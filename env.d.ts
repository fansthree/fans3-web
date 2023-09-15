declare type PublicConstructor<T = {}> = new (...args: any[]) => T

declare module '*.scss'
declare module '*.css'
declare module '*.css?inline'
declare module '*.html'
declare module '*.js'
declare module '*.cjs'
declare module '*.wasm'
//
declare module 'safe-decode-uri-component'
//
interface ImportMeta {
  env: Record<string, string>
}
