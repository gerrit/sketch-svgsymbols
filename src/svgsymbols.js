import XML2JS from 'xml2js'
import XPath from 'xml2js-xpath'

var xmlNamespace = 'http://xmlns.gerritkaiser.de/svgsymbols'

function findDocument() {
  const windows = NSApp.windows()
  for(let i = 0; i< windows.length; i++) {
    if (windows[i].isKindOfClass(MSDocumentWindow)) {
      return windows[i].document()
    }
  }
}

function findTextLayers(parsedSVG) {
  return XPath.find(parsedSVG, "//text")
}

// takes callback(parsedSVG)->parsedSVG
function filterSVGExport(path, callback) {
  var svgString = "" + NSString.stringWithContentsOfFile_encoding_error(path, NSUTF8StringEncoding, nil)
  log(svgString)
  // svgString = 'munged'
  var builder = new XML2JS.Builder()
  XML2JS.parseString(svgString, function(err, parsed) {
    console.log(JSON.stringify(parsed))
    parsed['svg']['$']['xmlns:svgsymbols'] = xmlNamespace
    parsed['svg']['desc'] = 'Created with sketch-svgsymbols'
    var transformed = callback(parsed)
    var transformedSvgString = builder.buildObject(transformed)
    console.log(transformedSvgString)
    var newPath = path.replace(/.svg$/, '.svgsymbol')
    NSString.stringWithString(transformedSvgString).writeToFile_atomically_encoding_error(newPath, true, NSUTF8StringEncoding, nil)
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

function isCentered(textLayer) {
  log('textLayer')
  log(textLayer)
  const leftTextAlignment = 0 //can be (null) too
  const centeredTextAlignment = 2
  const rightTextAlignment = 1
  const justifyTextAlignment = 3
  return textLayer.textAlignment() == centeredTextAlignment
}

function fixupTextCentering(elem, layer) {
  // HACK: assuming one tspan only, which is true for symbols w overrides
  // but not necessarily for other scenario
  elem['tspan'][0]['$']['text-anchor'] = 'middle'
  // 50% doesnt work, leaving here for reference
  // elem['tspan'][0]['$']['x'] = '50%'
  elem['tspan'][0]['$']['x'] = layer.rect().size.width/2
}

function setOverrideName(elem, layer) {
  elem['$']['svgsymbols:name'] = layer.name()
}

export function svgSymbolsHandler(context, params) {
  // HACK because `context` in an action handler doesn't have a `document`
  var doc = findDocument()
  var exports = context.actionContext.exports
  var filesToCompress = []
  for (var i = 0; i < exports.count(); i++) {
    var currentExport = exports.objectAtIndex(i)
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
        var textElements = findTextLayers(parsed)
        // TODO: deal with IDs with spaces in Sketch that are turned into 
        // dashes in SVG (need to do fuzzy matching)
        for (var i = 0; i < textElements.length; i++) {
          var elem = textElements[i]
          // TODO: deal with two layers that are children with the same name/id
          var layer = artboard.layerWithID_(elem['$']['id'])
          if(!layer) {
            log('Warning: No corresponding Sketch Layer found for element: ')
            log(elem)
            break;
          }
          setOverrideName(elem, layer)
          if(isCentered(layer)) {
            fixupTextCentering(elem, layer)
          }
        }
        return parsed
      })
    }
  }
  doc.showMessage("SVGSymbols exported 🙌")
}
