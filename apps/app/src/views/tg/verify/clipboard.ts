export const copyCmd = {
  readText: () => Promise.reject(),
  writeText: (v = '') =>
    new Promise((resolve, reject) => {
      try {
        const doc = document
        const el = doc.createElement('textarea')
        el.value = v
        doc.body.appendChild(el)
        el.value = v
        doc.body.appendChild(el)
        el.select()
        const is = doc.execCommand('copy')
        doc.body.removeChild(el)
        is ? resolve(true) : reject(false)
      } catch (e: any) {
        reject(false)
      }
    })
}
let { clipboard = <any>undefined } = navigator
if (!clipboard) {
  clipboard = copyCmd
}
export default clipboard
