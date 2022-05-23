const { stdin, stdout } = process;

const fs = require('fs');
const path = require('path');

const output = fs.createWriteStream(path.join(__dirname, 'notes.txt'));

stdout.write(`Привет! Введи текст для файла\n`);

stdin.on('data', data => {
  if (data.toString().trim() === 'exit') {
    process.exit();
  }
  output.write(data);
});

output.on('error', error => console.log('Error', error.message));
process.on('exit', () => stdout.write(`Пока!`));
process.on('SIGINT', () => process.exit());