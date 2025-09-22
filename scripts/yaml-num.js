import { dump, load } from 'js-yaml';
import { readFileSync, writeFileSync } from 'fs';

// Path to the YAML file
const filePath = './api.yaml';

// Read the YAML file
const fileContent = readFileSync(filePath, 'utf8');

// Parse the YAML content
const yamlData = load(fileContent);

// Modify the version number
if (yamlData.info && yamlData.info.version) {
  const versionParts = yamlData.info.version.split('.').map(Number);
  if (versionParts.length === 3) {
    versionParts[2] += 1; // Increment the patch version
    yamlData.info.version = versionParts.join('.');
  }
}

// Convert the updated YAML object back to a string
const updatedYamlContent = dump(yamlData);

// Write the updated content back to the file
writeFileSync(filePath, updatedYamlContent, 'utf8');

console.log('Version api.yaml number updated successfully: ' + yamlData.info.version);
