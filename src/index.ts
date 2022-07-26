import fs from 'fs';
import sharp from 'sharp';

// eslint-disable-next-line
type PipeFunction = (arg: any) => any | Promise<any>;

// eslint-disable-next-line
const promisePipe = (arg: any, ...fns: PipeFunction[]) =>
  fns.reduce(async (acc, fn) => {
    return fn(await acc);
  }, arg);

const createInputImage =
  (width: number) =>
  async (image: Buffer): Promise<Buffer> => {
    const result = await sharp(image)
      .resize({ width })
      .grayscale()
      .raw()
      .toBuffer();

    return result;
  };

const convertAscii =
  (asciiChars: string[]) =>
  (image: Buffer): string => {
    const interval = asciiChars.length / 256;
    const result = image.reduce((acc, cur) => {
      return acc + asciiChars[Math.floor(cur * interval)];
    }, '');

    return result;
  };

const splitCharEachNumber =
  (char: string) =>
  (size: number): string[] => {
    const result = [...char].reduce((acc, _, i) => {
      return i % size ? acc : [...acc, [...char].slice(i, i + size).join('')];
    }, [] as string[]);

    return result;
  };

const insertLineBreak =
  (width: number) =>
  (char: string): string => {
    const splitChar = splitCharEachNumber(char)(width);

    const result = splitChar.reduce((acc, cur) => {
      return acc + '\n' + cur;
    });

    return result;
  };

const main = async () => {
  const path = 'src/image.png';
  const asciiChars = [
    '  ',
    '::',
    ';;',
    '++',
    '**',
    '??',
    '##',
    'SS',
    '##',
    '@@',
  ];
  const width = 60;
  const renderWidth = width * asciiChars[0].length;

  const result = await promisePipe(
    fs.readFileSync(path),
    createInputImage(width),
    convertAscii(asciiChars),
    insertLineBreak(renderWidth),
  );

  console.log(result);
};

main();

if (import.meta.vitest) {
  const { assert, describe, it, expect } = import.meta.vitest;

  describe('test', () => {
    it('convertAscii - unit test', () => {
      const asciiChars = ['  ', '??', '@@'];
      const input = Buffer.from([255, 171, 170, 86, 85, 0]);
      const actual = convertAscii(asciiChars)(input);

      expect(actual).eq('@@@@????    ');
    });

    it('splitCharEachNumber - unit test', () => {
      const actual = splitCharEachNumber('0123456789')(2);

      assert.deepEqual(actual, ['01', '23', '45', '67', '89']);
    });

    it('insertLineBreak - unit test', () => {
      const input = '@@@@@@@@@@@@@@@@';
      const actual = insertLineBreak(4)(input);

      const expected = '@@@@\n@@@@\n@@@@\n@@@@';
      expect(actual).eq(expected);
    });
  });
}
