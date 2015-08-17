const path = require('path');
const co = require('co');
import run from './lib/run';
import delay from './lib/delay';
import tmpDir from './lib/tmp-dir';
import rmrf from './lib/rmrf';
import copy from './lib/copy';

describe('browserify-hmr', function() {
  let dir = null;

  beforeEach(co.wrap(function*() {
    dir = yield tmpDir();
  }));
  afterEach(co.wrap(function*() {
    if (dir) {
      yield rmrf(dir);
    }
    dir = null;
  }));

  it('basic case works', co.wrap(function*() {
    this.slow();
    const index = path.join(dir, 'basic-index.js');
    const dep = path.join(dir, 'basic-dep.js');
    const bundle = path.join(dir, 'bundle.js');

    yield copy('./test/data/basic-index.js', index);
    yield copy('./test/data/basic-dep1.js', dep);
    yield run('./node_modules/.bin/browserify', [
      '--node','-p','[','./index','-m','fs',']',index,'-o',bundle
    ]);
    yield Promise.all([
      run('node', [bundle]),
      co(function*() {
        yield delay(200);
        yield copy('./test/data/basic-dep2.js', dep);
        yield run('./node_modules/.bin/browserify', [
          '--node','-p','[','./index','-m','fs',']',index,'-o',bundle
        ]);
      })
    ]);
  }));

  it('self accepting works', co.wrap(function*() {
    this.slow();
    const index = path.join(dir, 'self-index.js');
    const dep = path.join(dir, 'self-dep.js');
    const bundle = path.join(dir, 'bundle.js');

    yield copy('./test/data/self-index.js', index);
    yield copy('./test/data/self-dep1.js', dep);
    yield run('./node_modules/.bin/browserify', [
      '--node','-p','[','./index','-m','fs',']',index,'-o',bundle
    ]);
    yield Promise.all([
      run('node', [bundle]),
      co(function*() {
        yield delay(200);
        yield copy('./test/data/self-dep2.js', dep);
        yield run('./node_modules/.bin/browserify', [
          '--node','-p','[','./index','-m','fs',']',index,'-o',bundle
        ]);
      })
    ]);
  }));

});