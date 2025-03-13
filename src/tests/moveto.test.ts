import { describe, test, expect } from '@jest/globals';
import { SVGPathData } from '../index.js';
import type { CommandM } from '../types.js';

describe('Parsing move to commands', () => {
  test('should not work with single coordinate', () => {
    expect(() => new SVGPathData('M100')).toThrow(
      new SyntaxError('Unterminated command at the path end.'),
    );
  });

  test('should not work with single complexer coordinate', () => {
    expect(() => new SVGPathData('m-10e-5')).toThrow(
      new SyntaxError('Unterminated command at the path end.'),
    );
  });

  test('should work with single coordinate followed by another', () => {
    expect(() => new SVGPathData('m-10m10 10')).toThrow(
      new SyntaxError('Unterminated command at index 4.'),
    );
  });

  test('should work with comma separated coordinates', () => {
    const commands = new SVGPathData('M100,100').commands as CommandM[];

    expect(commands[0].type).toEqual(SVGPathData.MOVE_TO);
    expect(commands[0].relative).toEqual(false);
    expect(commands[0].x).toEqual(100);
    expect(commands[0].y).toEqual(100);
  });

  test('should work with space separated coordinates', () => {
    const commands = new SVGPathData('m100 \t   100').commands as CommandM[];

    expect(commands[0].type).toEqual(SVGPathData.MOVE_TO);
    expect(commands[0].relative).toEqual(true);
    expect(commands[0].x).toEqual(100);
    expect(commands[0].y).toEqual(100);
  });

  test('should work with complexer coordinates', () => {
    const commands = new SVGPathData('m-10e-5 -10e-5').commands as CommandM[];

    expect(commands[0].type).toEqual(SVGPathData.MOVE_TO);
    expect(commands[0].relative).toEqual(true);
    expect(commands[0].x).toEqual(-10e-5);
    expect(commands[0].y).toEqual(-10e-5);
  });

  test('should work with even more complexer coordinates', () => {
    const commands = new SVGPathData('M-10.0032e-5 -10.0032e-5')
      .commands as CommandM[];

    expect(commands[0].type).toEqual(SVGPathData.MOVE_TO);
    expect(commands[0].relative).toEqual(false);
    expect(commands[0].x).toEqual(-10.0032e-5);
    expect(commands[0].y).toEqual(-10.0032e-5);
  });

  test('should work with comma separated coordinate pairs', () => {
    const commands = new SVGPathData('M123,456 7890,9876')
      .commands as CommandM[];

    expect(commands[0].type).toEqual(SVGPathData.MOVE_TO);
    expect(commands[0].relative).toEqual(false);
    expect(commands[0].x).toEqual(123);
    expect(commands[0].y).toEqual(456);
    expect(commands[1].type).toEqual(SVGPathData.LINE_TO);
    expect(commands[1].relative).toEqual(false);
    expect(commands[1].x).toEqual(7890);
    expect(commands[1].y).toEqual(9876);
  });

  test('should work with space separated coordinate pairs', () => {
    const commands = new SVGPathData('m123  \t 456  \n 7890  \r 9876')
      .commands as CommandM[];

    expect(commands[0].type).toEqual(SVGPathData.MOVE_TO);
    expect(commands[0].relative).toEqual(true);
    expect(commands[0].x).toEqual(123);
    expect(commands[0].y).toEqual(456);
    expect(commands[1].type).toEqual(SVGPathData.LINE_TO);
    expect(commands[1].relative).toEqual(true);
    expect(commands[1].x).toEqual(7890);
    expect(commands[1].y).toEqual(9876);
  });

  test('should work with nested separated coordinates', () => {
    const commands = new SVGPathData('M123 ,  456  \t,\n7890 \r\n 9876')
      .commands as CommandM[];

    expect(commands[0].type).toEqual(SVGPathData.MOVE_TO);
    expect(commands[0].relative).toEqual(false);
    expect(commands[0].x).toEqual(123);
    expect(commands[0].y).toEqual(456);
    expect(commands[1].type).toEqual(SVGPathData.LINE_TO);
    expect(commands[1].relative).toEqual(false);
    expect(commands[1].x).toEqual(7890);
    expect(commands[1].y).toEqual(9876);
  });

  test('should work with multiple command declarations', () => {
    const commands = new SVGPathData(`
      M123 ,  456  \t,\n7890 \r\n 9876m123
      ,  456  \t,\n7890 \r\n 9876
    `).commands as CommandM[];

    expect(commands[0].type).toEqual(SVGPathData.MOVE_TO);
    expect(commands[0].relative).toEqual(false);
    expect(commands[0].x).toEqual(123);
    expect(commands[0].y).toEqual(456);
    expect(commands[1].type).toEqual(SVGPathData.LINE_TO);
    expect(commands[1].relative).toEqual(false);
    expect(commands[1].x).toEqual(7890);
    expect(commands[1].y).toEqual(9876);
    expect(commands[2].type).toEqual(SVGPathData.MOVE_TO);
    expect(commands[2].relative).toEqual(true);
    expect(commands[2].x).toEqual(123);
    expect(commands[2].y).toEqual(456);
    expect(commands[3].type).toEqual(SVGPathData.LINE_TO);
    expect(commands[3].relative).toEqual(true);
    expect(commands[3].x).toEqual(7890);
    expect(commands[3].y).toEqual(9876);
  });
});

describe('Encoding move to commands', () => {
  test('should work with one command', () => {
    expect(new SVGPathData('M-50.0032e-5 -60.0032e-5').encode()).toEqual(
      'M-0.000500032 -0.000600032',
    );
  });

  test('should work with several commands', () => {
    expect(
      new SVGPathData(
        'M-50.0032e-5 -60.0032e-5M-50.0032e-5 -60.0032e-5M-50.0032e-5 -60.0032e-5',
      ).encode(),
    ).toEqual(
      'M-0.000500032 -0.000600032M-0.000500032 -0.000600032M-0.000500032 -0.000600032',
    );
  });
});
