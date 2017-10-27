import XML2JS from 'xml2js'
import XPath from 'xml2js-xpath'

function findDocument() {
  const windows = NSApp.windows()
  for(let i = 0; i< windows.length; i++) {
    if (windows[i].isKindOfClass(MSDocumentWindow)) {
      return windows[i].document();
    }
  }
}

function findTextLayerIds(parsedSVG) {
  var matches = XPath.find(parsedSVG, "//text")
  var ids = []
  for(let i = 0; i < matches.length; i++) {
    var match = matches[i]
    console.log('match!')
    console.log(JSON.stringify(match))
    ids.push(match['$']['id'])
  }
  return ids
}

// takes callback(parsedSVG)->parsedSVG
function filterSVGExport(path, callback) {
  var svgString = "" + NSString.stringWithContentsOfFile_encoding_error(path, NSUTF8StringEncoding, nil)
  log(svgString)
  // svgString = 'munged'
  var builder = new XML2JS.Builder()
  XML2JS.parseString(svgString, function(err, parsed) {
    console.log(JSON.stringify(parsed))
    parsed['svg']['desc'] = 'Created with sketch-svgsymbols'
    var transformed = callback(parsed)
    var transformedSvgString = builder.buildObject(transformed)
    console.log(transformedSvgString)
    NSString.stringWithString(transformedSvgString).writeToFile_atomically_encoding_error(path, true, NSUTF8StringEncoding, nil)
  })
}

function findArtboardForRect(document, rect) {
  var artboards = document.artboards();
  for (var i = 0; i < artboards.count(); i++) {
    var currentArtboard = artboards[i]
    if(CGRectEqualToRect(currentArtboard.rect(), rect)) {
      return currentArtboard
    }
  }
}

export function svgSymbolsHandler(context, params) {
  // HACK because `context` in an action handler doesn't have a `document`
  var doc = findDocument();
  var exports = context.actionContext.exports
  log('ctx')
  log(context)
  log('action')
  log(context.actionContext)
  log('exp')
  log(exports)
  var filesToCompress = []
  for (var i = 0; i < exports.count(); i++) {
    var currentExport = exports.objectAtIndex(i)
    log('export')
    log(currentExport)
    log(currentExport.request)
    log('layer ids')
    
    // HACK: somewhat surprisingly, MSExportRequests don't have a reference to
    // the artboard being exported.
    // Walked through this w/ Pieter Omvlee & there are  historical reasons for
    // that (exporting artboards layered above other artboards).
    // So we have to take the coordinates and walk throguh all artboards to find
    // match that we can be reasonably sure is the right one.
    // TODO: handle slices using `currentExport.request.includedLayerIDs()`
    var artboard = findArtboardForRect(doc, currentExport.request.rect())
    if (currentExport.request.format() == 'svg') {
      filterSVGExport(currentExport.path, function(parsed) {
        var ids = findTextLayerIds(parsed)
        log('ids')
        log(ids)
        // TODO: deal with IDs with spaces in Sketch that are turned into 
        // dashes in SVG (need to do fuzzy matching)
        for (var i = 0; i < ids.length; i++) {
          // TODO: deal with two layers that are children with the same name/id
          var layer = artboard.layerWithID_(ids[i])
          log('layer')
          log(layer)
          if(layer) {
            // TODO: process
          }
        }
      })
    }
  }
  doc.showMessage("It's alive 🙌")
}
