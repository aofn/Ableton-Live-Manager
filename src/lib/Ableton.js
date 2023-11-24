import xml2js from "xml2js";
import pako from "pako";
import * as xmlJs from "xml-js";

class Ableton {
  UnpackAndCreatJson(xml, OnLoaded, OnError, Original) {
    const parsed = pako.ungzip(xml, { to: "string" });
    let parser = new xml2js.Parser({
      mergeAttrs: true,
      explicitArray: false,
      sanitize: false,
    });
    const jsonData = xmlJs.xml2json(parsed);

    Original(JSON.parse(jsonData));

    parser.parseString(parsed, (err, result) => {
      if (!err) {
        OnLoaded(result);
      } else {
        OnError(err);
      }
    });
  }

  static RemoveDevices(obj, pluginsToRemove) {
    const searchAndRemove = (currentObject, path = []) => {
      if (Array.isArray(currentObject)) {
        for (let i = currentObject.length - 1; i >= 0; i--) {
          if (typeof currentObject[i] === "object") {
            if (
              currentObject[i].attributes &&
              pluginsToRemove.includes(currentObject[i].attributes.Value)
            ) {
              const devicesIndex = path.findIndex(
                (p) => p.obj.name === "Devices",
              );
              if (devicesIndex !== -1) {
                path[devicesIndex + 1].arr.splice(
                  path[devicesIndex + 1].index,
                  1,
                );
              }
            } else {
              searchAndRemove(currentObject[i], [
                ...path,
                { arr: currentObject, index: i, obj: currentObject[i] },
              ]);
            }
          }
        }
      } else if (typeof currentObject === "object") {
        for (let key in currentObject) {
          if (typeof currentObject[key] === "object") {
            searchAndRemove(currentObject[key], path);
          }
        }
      }
    };

    // This is needed in order to not create corrupted files:
    // https://github.com/nashwaan/xml-js/issues/26
    const encodeHTML = function (attributeValue) {
      return attributeValue
        .replace(/&quot;/g, '"') // convert quote back before converting amp
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    searchAndRemove(obj);
    return xmlJs.json2xml(obj, {
      attributeValueFn: encodeHTML,
    });
  }
}

export default Ableton;
