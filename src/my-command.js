export function svgSymbolsHandler (context) {
  const windows = NSApp.windows()
  for(let i = 0; i< windows.length; i++) {
    if (windows[i].isKindOfClass(MSDocumentWindow)) {
      const doc = windows[i].document()
      doc.showMessage("It's alive 🙌")
    }
  }
}
