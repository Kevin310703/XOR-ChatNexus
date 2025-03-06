import { KeyvFile } from 'keyv-file';

const logFile = new KeyvFile({ filename: './data/logs.json' });
const pendingReqFile = new KeyvFile({ filename: './data/pendingReqCache.json' });
const violationFile = new KeyvFile({ filename: './data/violations.json' });

export default {
  logFile,
  pendingReqFile,
  violationFile,
};
