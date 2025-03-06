import { authenticate } from 'passport';

const requireJwtAuth = authenticate('jwt', { session: false });

export default requireJwtAuth;
