import fs from 'fs';
import sharp from 'sharp';

const promisePipe = (arg, ...fns) => fns.reduce(async (acc, fn) => {
  return fn(await acc);
}, arg);
const createInputImage = (width) => async (image) => {
  const result = await sharp(image).resize({ width }).grayscale().raw().toBuffer();
  return result;
};
const convertAscii = (asciiChars) => (image) => {
  const interval = asciiChars.length / 256;
  const result = image.reduce((acc, cur) => {
    return acc + asciiChars[Math.floor(cur * interval)];
  }, "");
  return result;
};
const splitCharEachNumber = (char) => (size) => {
  const result = [...char].reduce((acc, _, i) => {
    return i % size ? acc : [...acc, [...char].slice(i, i + size).join("")];
  }, []);
  return result;
};
const insertLineBreak = (width) => (char) => {
  const splitChar = splitCharEachNumber(char)(width);
  const result = splitChar.reduce((acc, cur) => {
    return acc + "\n" + cur;
  });
  return result;
};
const main = async () => {
  const path = "src/image.png";
  const asciiChars = [
    "  ",
    "::",
    ";;",
    "++",
    "**",
    "??",
    "##",
    "SS",
    "##",
    "@@"
  ];
  const width = 60;
  const renderWidth = width * asciiChars[0].length;
  const result = await promisePipe(
    fs.readFileSync(path),
    createInputImage(width),
    convertAscii(asciiChars),
    insertLineBreak(renderWidth)
  );
  console.log(result);
};
main();
