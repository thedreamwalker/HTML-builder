const { stdin, stdout } = process;

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

async function getInfo () {
  try {
    const files = await fs.promises.readdir('03-files-in-folder/secret-folder', { withFileTypes: true});
    for (const file of files) {
      if (file.isFile()) {
        const pathFile = path.join(__dirname, 'secret-folder', file.name);
        
        (async () => {
          try {
            const stats = await fsPromises.stat(pathFile);

            console.log(`${file.name.substring(0, file.name.indexOf('.'))} — ${path.extname(pathFile).slice(1)} — ${stats.size/1000}kb`);
          } 
          catch (error) {
            console.log(error);
          }
        })();
        
      }

    }
  } catch (err) {
    console.error(err);
  }
}

getInfo();