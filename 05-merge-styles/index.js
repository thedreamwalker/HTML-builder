const { stdin, stdout } = process;

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

async function bundler () {
  const pathBundle = path.join(__dirname, 'project-dist', 'bundle.css');

  await fs.stat(pathBundle, async function(err) {
    if (!err) {
      await fs.unlink(pathBundle, err => {
        if (err) { console.error(err); }
     });
  }
    await fs.writeFile(
      path.join(__dirname, 'project-dist', 'bundle.css'),
      '',
      (err) => {
        if (err) { console.error(err); }
      }
  );
  });

  fs.readdir(path.join(__dirname, 'styles'), async (err, files) => {
    if (err) { console.error(err); }

    let allFiles = [];

    for (const file of files) {
      const stats = await fsPromises.stat(path.join(__dirname, 'styles', file));
      const pathFile = path.join(__dirname, 'styles', file);
    
      if (stats.isFile() && path.extname(pathFile).slice(1) === 'css') {
        allFiles.push(file);
      }
    }

    let writeableStream = await fs.createWriteStream(path.join(__dirname, 'project-dist', 'bundle.css'));

    for (const file of allFiles) {
      const pathFile = path.join(__dirname, 'styles', file);

      let readableStream = await fs.createReadStream(
        pathFile,
        'utf8'
      );
      
      readableStream.pipe(writeableStream);

      /*
      await fs.readFile(pathFile, 'utf8', async function(err, fileContent){
        if (err) { console.error(err); }
        let toWrite = fileContent + "\n";
        await fs.writeFile(path.join(__dirname, 'project-dist', 'bundle.css'), toWrite, (err) => {
          if (err) { console.error(err); }
          console.log('записали ' + pathFile);
        });
     });*/
    }

  });
}

bundler();