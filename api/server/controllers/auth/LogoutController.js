import { parse } from 'cookie';
import { Issuer } from 'openid-client';
import { logoutUser } from '~/server/services/AuthService';
import { isEnabled } from '~/server/utils';
import _default from '~/config';
const { logger } = _default;

const logoutController = async (req, res) => {
  const refreshToken = req.headers.cookie ? parse(req.headers.cookie).refreshToken : null;
  try {
    const logout = await logoutUser(req, refreshToken);
    const { status, message } = logout;
    res.clearCookie('refreshToken');
    const response = { message };
    if (
      req.user.openidId != null &&
      isEnabled(process.env.OPENID_USE_END_SESSION_ENDPOINT) &&
      process.env.OPENID_ISSUER
    ) {
      const issuer = await Issuer.discover(process.env.OPENID_ISSUER);
      const redirect = issuer.metadata.end_session_endpoint;
      if (!redirect) {
        logger.warn(
          '[logoutController] end_session_endpoint not found in OpenID issuer metadata. Please verify that the issuer is correct.',
        );
      } else {
        response.redirect = redirect;
      }
    }
    return res.status(status).send(response);
  } catch (err) {
    logger.error('[logoutController]', err);
    return res.status(500).json({ message: err.message });
  }
};

export default {
  logoutController,
};
