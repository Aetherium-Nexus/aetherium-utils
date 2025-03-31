import { expect } from 'chai';

import { isHttpsUrl, isRelativeUrl, isUrl } from './url.js';

describe('URL Utilities', () => {
  it('isUrl', () => {
    expect(isUrl(undefined)).to.be.false;
    expect(isUrl(null)).to.be.false;
    expect(isUrl('')).to.be.false;
    expect(isUrl('foobar')).to.be.false;
    expect(isUrl('https://aetherium-nexus.com')).to.be.true;
  });

  it('isHttpsUrl', () => {
    expect(isHttpsUrl(undefined)).to.be.false;
    expect(isHttpsUrl(null)).to.be.false;
    expect(isHttpsUrl('')).to.be.false;
    expect(isHttpsUrl('foobar')).to.be.false;
    expect(isHttpsUrl('http://aetherium-nexus.com')).to.be.false;
    expect(isHttpsUrl('https://aetherium-nexus.com')).to.be.true;
  });

  it('isRelativeUrl', () => {
    expect(isRelativeUrl(undefined)).to.be.false;
    expect(isRelativeUrl(null)).to.be.false;
    expect(isRelativeUrl('')).to.be.false;
    expect(isRelativeUrl('foobar')).to.be.false;
    expect(isRelativeUrl('https://aetherium-nexus.com')).to.be.false;
    expect(isRelativeUrl('/foobar')).to.be.true;
    expect(isRelativeUrl('/foo/bar', 'https://aetherium-nexus.com')).to.be.true;
  });
});
