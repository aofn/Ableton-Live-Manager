import xml2js from "xml2js";
import pako from "pako";
import * as xmlJs from "xml-js";
import { readTextFile, readDir, exists } from "@tauri-apps/api/fs";

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

  static async parseXmpFiles(projectDirectory) {
    const folderPath = `${projectDirectory}/Ableton Folder Info`;
    const folderExists = await exists(folderPath);

    if (!folderExists) {
      console.warn(`Directory ${folderPath} does not exist.`);
      return [];
    }

    const files = await readDir(folderPath);
    const xmpFiles = files.filter((file) => file.name.endsWith(".xmp"));

    const allKeywords = [];
    for (const file of xmpFiles) {
      const xmpContent = await readTextFile(file.path);
      xml2js.parseString(xmpContent, (err, result) => {
        if (err) {
          console.error("Error parsing XMP file:", err);
          return;
        }
        const keywords = result["x:xmpmeta"]["rdf:RDF"][0][
          "rdf:Description"
        ][0]["ablFR:items"][0]["rdf:Bag"][0]["rdf:li"][0]["ablFR:keywords"][0][
          "rdf:Bag"
        ][0]["rdf:li"].map((li) => {
          const [group, tag] = li.split("|");
          return {
            [li]: {
              label: tag,
              variant: "outline",
              value: li,
              group: group,
            },
          };
        });
        console.log(keywords);
        allKeywords.push(...keywords);
      });
    }
    return allKeywords;
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
