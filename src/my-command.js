import XML2JS from 'xml2js'

function showMessage(str) {
  // HACK because `context` in an action handler doesn't have a `document`
  const windows = NSApp.windows()
  for(let i = 0; i< windows.length; i++) {
    if (windows[i].isKindOfClass(MSDocumentWindow)) {
      const doc = windows[i].document()
      doc.showMessage(str)
    }
  }
}

function filterSVGFile(path) {
  var svgString = "" + NSString.stringWithContentsOfFile_encoding_error(path, NSUTF8StringEncoding, nil)
  log(svgString)
  // svgString = 'munged'
  var builder = new XML2JS.Builder()
  XML2JS.parseString(svgString, function(err, parsed) {
    console.log(JSON.stringify(parsed))
    parsed['svg']['desc'] = 'Created with sketch-svgsymbols'
    var transformedSvgString = builder.buildObject(parsed)
    console.log(transformedSvgString)
    NSString.stringWithString(transformedSvgString).writeToFile_atomically_encoding_error(path, true, NSUTF8StringEncoding, nil)
  })
}

export function svgSymbolsHandler(context, params) {
  var exports = context.actionContext.exports
  var filesToCompress = []
  for (var i = 0; i < exports.count(); i++) {
    var currentExport = exports.objectAtIndex(i)
    log('export')
    log(currentExport)
    if (currentExport.request.format() == 'svg') {
      filterSVGFile(currentExport.path)
    }
  }
  showMessage("It's alive 🙌")
}
