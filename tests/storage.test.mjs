import test from 'node:test';
import assert from 'node:assert/strict';
import { readStorage, writeStorage, removeStorage } from '../src/lib/storage.ts';
test('session identity wins over stale storage when saving or deleting is blocked', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis,'localStorage');
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=> 'old member',setItem:()=>{throw new Error('blocked');},removeItem:()=>{throw new Error('blocked');}}});
  try {
    assert.equal(readStorage('storage-test'),'old member');
    assert.equal(writeStorage('storage-test','new member'),false);
    assert.equal(readStorage('storage-test'),'new member');
    removeStorage('storage-test');
    assert.equal(readStorage('storage-test'),null);
  } finally { if(previous) Object.defineProperty(globalThis,'localStorage',previous); else delete globalThis.localStorage; }
});
