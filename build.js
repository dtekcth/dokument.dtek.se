/* jshint node: true, browser: false, esversion: 6 */

/*

    Document database to find documents easier.

    Copyright 2018 Emil Hemdal
    Copyright 2018 Datateknologsektionen Chalmers Studentkår

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/

const fs = require('fs');

const process = require('process');

const del = require('del');

const CleanCSS = require('clean-css');

const pug = require('pug');

const template = pug.compileFile('./src/template.pug');

const docPath = './src/documents';

const basePath = '/';

let categories;

let shortcuts = [];

del.sync([__dirname + '/serve/*']);

try {
  categories = require(docPath + '/categories.json');
} catch(err) {
  console.error('categories.json is missing or invalid! Error:', err.toString());
  process.exit(1);
}

//console.log('types', types);

for(let category of categories) {
  let stats;
  try {
    stats = fs.statSync(docPath + '/' + category.path);
  } catch(err) {
    console.error('Found an category in categories.json that didn\'t have a folder, ignoring:', category.path);
    category.invalid = true;
    continue;
  }

  if(!stats.isDirectory()) { // filter out invalid paths
    console.error('Found an category in categories.json where the path was a file, ignoring:', category.path);
    category.invalid = true;
    continue;
  }

  let files = fs.readdirSync(docPath + '/' + category.path);

  if(files.length === 0) {
    console.error('Found an category in categories.json that didn\'t have any files, ignoring:', category.path);
    category.invalid = true;
    continue;
  }

  files.reverse();

  category.invalid = false;

  category.files = [];

  for(let file of files) {
    let stats = fs.statSync(docPath + '/' + category.path + '/' + file);
    if(stats.isDirectory()) { // filter out directories
      continue;
    }
    if(file.substr(file.length - 5) !== '.json') { // filter out .json files
      let jsonFile = file.substr(0, file.lastIndexOf('.')) + '.json';
      if(files.indexOf(jsonFile) !== -1) { // corresponding .json file exists
        let jsonData;
        //console.log('File and JSON found!', file, jsonFile);
        try {
          jsonData = require(docPath + '/' + category.path + '/' + jsonFile);
        } catch(err) {
          console.error('Invalid JSON data in:', docPath + '/' + category.path + '/' + jsonFile);
          continue;
        }

        let obj = {
          name: file,
          meta: jsonData,
          directLink: category.path + '/' + file,
          pageLink: category.path + '/' + file.substr(0, file.lastIndexOf('.'))
        };

        category.files.push(obj);
        if(jsonData.shortcut) {
          shortcuts.push(obj);
        }
      } else {
        console.error('Found an orphan document (as in a document missing a JSON file), ignoring:', docPath + '/' + category.path + '/' + file);
      }
    }
  }
}

categories = categories.filter(category => !category.invalid); // Filter out invalid categories

if(categories.length > 0) {
  categories[0].selected = true;
}

let htmlData = template({basePath: basePath, selectedDocument: false, categories: categories, shortcuts: shortcuts});

if(categories.length > 0) {
  categories[0].selected = false;
}

fs.writeFileSync('./serve/index.html', htmlData, {
  encoding: 'utf8',
  mode: 0o644,
});

for(let category of categories) {
  fs.mkdirSync('./serve/' + category.path, {
    mode: 0o755,
  });
  category.selected = true;
  htmlData = template({basePath: basePath, selectedDocument: false, categories: categories, shortcuts: shortcuts});

  fs.writeFileSync('./serve/' + category.path + '/index.html', htmlData, {
    encoding: 'utf8',
    mode: 0o644,
  });

  for(let file of category.files) {
    let name = file.name.substr(0, file.name.lastIndexOf('.'));
    fs.mkdirSync('./serve/' + category.path + '/' + name, {
      mode: 0o755,
    });
    file.selected = true;
    htmlData = template({basePath: basePath, selectedDocument: file, categories: categories, shortcuts: shortcuts});

    fs.writeFileSync('./serve/' + category.path + '/' + name + '/index.html', htmlData, {
      encoding: 'utf8',
      mode: 0o644,
    });

    file.selected = false;

    fs.writeFileSync('./serve/'+category.path + '/' +file.name, fs.readFileSync('./src/documents/' + category.path + '/' + file.name), {
      mode: 0o644,
    });
  }

  category.selected = false;
}

let pureCSS = [];

pureCSS.push(fs.readFileSync('./node_modules/purecss/build/base.css', {encoding: 'utf8'}));
pureCSS.push(fs.readFileSync('./node_modules/purecss/build/grids.css', {encoding: 'utf8'}));
pureCSS.push(fs.readFileSync('./node_modules/purecss/build/grids-responsive.css', {encoding: 'utf8'}));
pureCSS.push(fs.readFileSync('./node_modules/purecss/build/menus-core.css', {encoding: 'utf8'}));
pureCSS.push(fs.readFileSync('./node_modules/purecss/build/menus-skin.css', {encoding: 'utf8'}));
pureCSS.push(fs.readFileSync('./node_modules/purecss/build/buttons.css', {encoding: 'utf8'}));
let style  = fs.readFileSync('./src/style.css', {encoding: 'utf8'});

let concatPureCSS = pureCSS.join('\n');

pureCSS = null; // GC

// Cleans out excessive license comments
let cleanConcatPureCSS = new CleanCSS({
  sourceMap: true,
  level: {
    1: {
      all: false,
      specialComments: 2
    }
  },
  format: 'beautify',
}).minify(concatPureCSS);

concatPureCSS = null; // GC

let allCSS = cleanConcatPureCSS.styles + style;

fs.writeFileSync('./serve/style.css', allCSS, {
  encoding: 'utf8',
  mode: 0o644,
});

let minCSS = new CleanCSS({
  sourceMap: true,
  level: 2,
}).minify(allCSS);

allCSS = null; // GC

fs.writeFileSync('./serve/style.min.css', minCSS.styles, {
  encoding: 'utf8',
  mode: 0o644,
});

fs.writeFileSync('./serve/style.min.css.map', minCSS.sourceMap, {
  encoding: 'utf8',
  mode: 0o644,
});

minCSS = null; // GC

fs.mkdirSync('./serve/img', {
  mode: 0o755,
});

let images = fs.readdirSync('./src/img');

for(let image of images) {
  fs.writeFileSync('./serve/img/'+image, fs.readFileSync('./src/img/'+image), {
    mode: 0o644,
  });
}
