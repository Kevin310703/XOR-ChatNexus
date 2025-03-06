import { readFileSync } from 'fs';
import { load } from 'js-yaml';

function loadYaml(filepath) {
  try {
    let fileContents = readFileSync(filepath, 'utf8');
    return load(fileContents);
  } catch (e) {
    return e;
  }
}

export default loadYaml;
