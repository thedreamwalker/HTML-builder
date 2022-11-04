const { stdin, stdout } = process;

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

async function copyDir (scrDir, dstDir) {
  async function delDir (dir) {
    const files = await fs.promises.readdir(dir);

    if (files) {
      for (const file of files) {
        const stats = await fsPromises.stat(path.join(dir, file));
        
        if (stats.isFile()) {
          await fs.unlink(path.join(dir, file), (err) => {
            if (err) { console.error(err); }
          });
        } else {
          await delDir(path.join(dir, file));
        }
      }
    }

    await fs.promises.readdir(dir);

    fs.rmdir(dir, err => {
      if(err) { console.error(err); }
    });
  }

  try {
    fs.stat(dstDir, async function(err) {
      if (!err) {
          await delDir(dstDir);
      }

      await fs.mkdir(dstDir, { recursive: true }, err => {
        if (err) { console.error(err); }
      });

      fs.readdir(scrDir, async (err, files) => {
        if (err) { console.error(err); }

        for (const file of files) {
          const stats = await fsPromises.stat(path.join(scrDir, file));
        
          if (stats.isFile()) {
            fs.copyFile(path.join(scrDir, file), path.join(dstDir, file), err => {
              if (err) { console.error(err); }
          });
          } else {
            copyDir(path.join(scrDir, file), path.join(dstDir, file)); 
          }
          
        }
      });
  });
  } catch (err) {
    console.error(err);
  }
  
}

copyDir(path.join(__dirname, 'files'), path.join(__dirname, 'files-copy'));