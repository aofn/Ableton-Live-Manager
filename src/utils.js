export function findDeep(obj, key, callback) {
  for (var k in obj) {
    //BaseCase
    if (k == key) callback(obj[k]);
    // RecursiveCase
    else if (typeof obj[k] == "object" && obj[k] !== null)
      findDeep(obj[k], key, callback);
  }
}
export function findDeepAndRemove(obj, key, callback) {
  for (var k in obj) {
    //BaseCase
    if (k == key) {
      console.log(obj(k));
      // delete obj[k]
    }
    // RecursiveCase
    else if (typeof obj[k] == "object" && obj[k] !== null)
      findDeepAndRemove(obj[k], key, callback);
  }
}

export function findValueDeep(obj, value, callback, path = []) {
  for (var k in obj) {
    // console.log(obj[Object.keys(obj)[0]])
    // console.log(k)
    //BaseCase
    const arrayPath = [...path];
    arrayPath.push(k);
    if (obj[Object.keys(obj)[0]] === value) {
      // console.log(arrayPath)
      callback(arrayPath);
    }
    // RecursiveCase
    else if (typeof obj[k] == "object" && obj[k] !== null)
      findValueDeep(obj[k], value, callback, arrayPath);
  }
}
