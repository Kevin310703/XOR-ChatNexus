import expressStaticGzip from 'express-static-gzip';

const oneDayInSeconds = 24 * 60 * 60;

const sMaxAge = process.env.STATIC_CACHE_S_MAX_AGE || oneDayInSeconds;
const maxAge = process.env.STATIC_CACHE_MAX_AGE || oneDayInSeconds * 2;

const staticCache = (staticPath) =>
  expressStaticGzip(staticPath, {
    enableBrotli: false, // disable Brotli, only using gzip
    orderPreference: ['gz'],
    setHeaders: (res, _path) => {
      if (process.env.NODE_ENV?.toLowerCase() === 'production') {
        res.setHeader('Cache-Control', `public, max-age=${maxAge}, s-maxage=${sMaxAge}`);
      }
    },
  });

export default staticCache;
