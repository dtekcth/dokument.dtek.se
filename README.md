
# Document Database Client
Made to organize and display PDFs.

## How to use?
Install `node.js` and `npm`.

Clone this repository using your git cli.

Enter the directory and run `npm install`.

Run `node build.js`.

Serve the `serve/` folder using your favorite http server.

### How do I add/change/remove the PDFs?
First look in `src/documents/categories.json`, then in one of the document metadata files like
`src/documents/stadgar/2017-05-15-stadgar-dtek.json` then try to do something similar with your own PDFs.

After making changes in `src/documents/` you should run `node build.js`
(BEWARE that `node build.js` wipes everything in the `serve/` folder).


## License
Code: GNU Affero General Public License (LICENSE)

`*.pdf` (all the PDFs): Copyright Datateknologsektionen Chalmers Studentkår

`datalogo.svg`: Copyright Datateknologsektionen Chalmers Studentkår

`PDF.png`, `PDF.svg`, `TEX.svg`: CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/) by Emil Hemdal

Design: CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/) by Emil Hemdal

### External
Pure.css Copyright Yahoo! Inc. https://purecss.io/

normalize.css Copyright Nicolas Gallagher and Jonathan Neal https://necolas.github.io/normalize.css/

## Author
Emil Hemdal
