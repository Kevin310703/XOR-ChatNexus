import { authenticate } from 'passport';
import DebugControl from '../../utils/debug.js';

function log({ title, parameters }) {
  DebugControl.log.functionName(title);
  if (parameters) {
    DebugControl.log.parameters(parameters);
  }
}

const requireLocalAuth = (req, res, next) => {
  authenticate('local', (err, user, info) => {
    if (err) {
      log({
        title: '(requireLocalAuth) Error at passport.authenticate',
        parameters: [{ name: 'error', value: err }],
      });
      return next(err);
    }
    if (!user) {
      log({
        title: '(requireLocalAuth) Error: No user',
      });
      return res.status(404).send(info);
    }
    if (info && info.message) {
      log({
        title: '(requireLocalAuth) Error: ' + info.message,
      });
      return res.status(422).send({ message: info.message });
    }
    req.user = user;
    next();
  })(req, res, next);
};

export default requireLocalAuth;
