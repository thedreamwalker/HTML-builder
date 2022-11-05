const { stdin, stdout } = process;

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

async function bundler () {

  /* delete directory */
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

  /* bundler html */
  async function bundlerHTML () {
    let template = await fs.promises.readFile(path.join(__dirname, 'template.html'), 'utf8');
    let allFiles = [];

    await fs.readdir(path.join(__dirname, 'components'), async (err, files) => {
      if (err) { console.error(err); }

      for (const file of files) {
        const stats = await fsPromises.stat(path.join(__dirname, 'components', file));
        const pathFile = path.join(__dirname, 'components', file);
      
        if (stats.isFile() && path.extname(pathFile).slice(1) === 'html') {
          allFiles.push(file);
        }
      }

      for (const file of allFiles) {
        const content = await fs.promises.readFile(path.join(__dirname, 'components', file), 'utf8');
        
        template = template.replaceAll(`{{${file.substring(0, file.indexOf('.'))}}}`, content);
      }
  
      await fs.writeFile(path.join(__dirname, 'project-dist', 'index.html'), template, (err) => {
        if (err) { console.error(err); }
      });
    });
  }

  /* bundler css */

  async function bundlerCSS () {
    const pathBundle = path.join(__dirname, 'project-dist', 'style.css');
  
    await fs.stat(pathBundle, async function(err) {
      if (!err) {
        await fs.unlink(pathBundle, err => {
          if (err) { console.error(err); }
       });
    }
      await fs.writeFile(
        pathBundle,
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
  
      let writeableStream = await fs.createWriteStream(pathBundle);
  
      for (const file of allFiles) {
        const pathFile = path.join(__dirname, 'styles', file);
  
        let readableStream = await fs.createReadStream(
          pathFile,
          'utf8'
        );
        
        readableStream.pipe(writeableStream);
      }
  
    });
  }

  /*copy directory */

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
  
  try {
    fs.stat(path.join(__dirname, 'project-dist'), async function(err) {
      if (!err) {
          await delDir(path.join(__dirname, 'project-dist'));
      }

      await fs.mkdir(path.join(__dirname, 'project-dist'), { recursive: true }, err => {
        if (err) { console.error(err); }
      });

      bundlerHTML();
      bundlerCSS();
      copyDir(path.join(__dirname, 'assets'), path.join(__dirname, 'project-dist', 'assets'));

  });
  } catch (err) {
    console.error(err);
  }
}

bundler();