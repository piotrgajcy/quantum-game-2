const fs = require('fs');
const MarkDownIt = require('markdown-it');

const elementsEntriesDir = 'src/assets/encyclopedia/elements/';
const keyConceptsEntriesDir = 'src/assets/encyclopedia/key-concepts/';

const targetFile = 'src/assets/data/entries/entries.json';

const dirList = [elementsEntriesDir, keyConceptsEntriesDir];

const mdOptions = {
  html: true
};
const md = new MarkDownIt(mdOptions);

function dashedToCamelCase(str) {
  const alteredString = str.replace(/-(.)/g, (m, group1) => {
    return group1.toUpperCase();
  });
  return alteredString.charAt(0).toUpperCase() + alteredString.slice(1);
}

function scrubTheTags(stringToClean) {
  const tagLength = stringToClean.indexOf('>') + 1;
  const closingTagLength = tagLength + 1;
  return stringToClean.slice(tagLength, stringToClean.length - closingTagLength);
}

function convertMarkdown(directoryList) {
  let returnedObject = {};

  directoryList.forEach((dir) => {
    const dirEntries = fs.readdirSync(dir);
    dirEntries.forEach((fileName) => {
      // within each file:
      if (fileName.endsWith('md')) {
        const filePath = dir + fileName;
        const entryName = fileName.substring(0, fileName.length - 3);
        returnedObject = {
          ...returnedObject,
          [entryName]: {
            title: '',
            elementName: dashedToCamelCase(entryName),
            short: '',
            grids: [
              {
                cols: 0,
                rows: 0,
                cells: []
              }
            ],
            sections: [
              {
                title: '',
                content: ''
              }
            ]
          }
        };

        const thisEntry = returnedObject[entryName];
        // read the file in UTF8
        const readFile = fs.readFileSync(filePath, 'utf8');
        // transform it into markup
        const markedUpEntry = md.render(readFile);
        // split it on newlines
        const entryLines = markedUpEntry.split('\n');
        // set up variables used for progress evaluation:
        let isFistParagraph = true;
        let currentSectionNumber = 0;
        let gridParsingMode = false;
        let currentGridString = '';
        let numberOfCompleteGrids = 0;

        // parse, line by line
        for (let i = 0; i < entryLines.length; i += 1) {
          const line = entryLines[i];
          const nextLine = entryLines[i + 1];
          // if we're in a mini-grid parsing mode - check below:
          if (gridParsingMode) {
            currentGridString += line;
            // handle end of grid parsing mode:
            if (nextLine.startsWith('</code>')) {
              // replace HTML &quote; entitiy with actual quote character:
              const quotRegExp = /&quot;/g;
              const quotedGridString = currentGridString.replace(quotRegExp, '"');
              // add to the thisEntry
              thisEntry.grids[numberOfCompleteGrids] = JSON.parse(quotedGridString);
              // in case there's another grid, let's have it added under a different index:
              numberOfCompleteGrids += 1;
              gridParsingMode = false;
            }
          } else if (line.startsWith('<h')) {
            // handle titles:
            const scrubbedTitle = scrubTheTags(line);
            if (line.startsWith('<h1')) {
              // handle main title:
              thisEntry.title = scrubbedTitle;
            } else {
              isFistParagraph = false;
              // handle secondary title:
              thisEntry.sections[currentSectionNumber] = {
                title: scrubbedTitle,
                content: ''
              };
            }
            // mark the beginning of the mini-grid parsing mode:
          } else if (line.startsWith('<pre>')) {
            gridParsingMode = true;
            currentGridString = '{';
          }
          // handle block elements:
          else if (
            line.startsWith('<p>') ||
            line.startsWith('<ul>') ||
            line.startsWith('</ul>') ||
            line.startsWith('<li>')
          ) {
            // handle paragraph, depending whether short or sections content
            if (line.startsWith('<p>') && isFistParagraph) {
              thisEntry.short = scrubTheTags(line);
              isFistParagraph = false;
            }
            if (thisEntry.sections[currentSectionNumber].content) {
              // if there are already contents for section, let's concatenate:
              thisEntry.sections[currentSectionNumber].content += line;
            } else {
              // if there is no content already, populate the 'contents' property:
              thisEntry.sections[currentSectionNumber].content = line;
            }
            // in case the upcoming line marks a beginning of a new section,
            // make sure the section counter goes up:
            if (nextLine && nextLine.startsWith('<h2')) {
              currentSectionNumber += 1;
            }
          }
        }
      }
    });
    const entriesFile = JSON.stringify(returnedObject, null, 2);
    console.log(`extracting JSON from ${dir}`);
    fs.writeFile(targetFile, entriesFile, (err) => {
      if (err) throw err;
    });
  });
  console.log('entries.json created!');
  return returnedObject;
}

convertMarkdown(dirList);
