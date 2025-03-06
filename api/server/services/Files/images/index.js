import avatar from './avatar';
import convert from './convert';
import encode from './encode';
import parse from './parse';
import resize from './resize';

export default {
  ...convert,
  ...encode,
  ...parse,
  ...resize,
  avatar,
};
