import test from 'ava';
import fs from 'fs';
import sinon from 'sinon';
import {EOL as newline} from 'os';
import Match from './../lib/streams/Match';
import {PassThrough} from 'stream';

const path = 'target/example-frontend-enterprise/app/views/example.scala.html'
const lineArray = [
  '<div tag>',
  '<div tag="data" class="header">',
  '<div class="footer" tag="data">',
  '<div tag attr>',
  '<tag>',                            // should not match
  '<div claa="tag">',                 // should not match
  'some test with tag.'               // should not match
];
const fsStub = sinon.stub(fs, 'readFileSync', () => {
  return lineArray.join(newline);
});

test.after('cleanup', t => fsStub.restore());

test('with -a flag, lines only match against the attribute regex', async t => {
  const searchOptions = {
    searchString: 'tag',
    searchMode: '-a'
  };
  const match = new Match({objectMode: true}, searchOptions);
  const passThrough = new PassThrough({objectMode: true});
  const expectedResults = [
    {
      filePath: path,
      lineNumber: 0,
      match: lineArray[0]
    },
    {
      filePath: path,
      lineNumber: 1,
      match: lineArray[1]
    },
    {
      filePath: path,
      lineNumber: 2,
      match: lineArray[2]
    },
    {
      filePath: path,
      lineNumber: 3,
      match: lineArray[3]
    }
  ];
  let count = 0;

  passThrough.write(path);
  passThrough.end();

  await passThrough
    .pipe(match)
    .on('data', item => t.deepEqual(item, expectedResults[count++]));

  t.is(count, expectedResults.length);
});
