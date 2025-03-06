import validatePasswordReset from './validatePasswordReset';
import validateRegistration from './validateRegistration';
import validateImageRequest from './validateImageRequest';
import buildEndpointOption from './buildEndpointOption';
import validateMessageReq from './validateMessageReq';
import checkDomainAllowed from './checkDomainAllowed';
import concurrentLimiter from './concurrentLimiter';
import validateEndpoint from './validateEndpoint';
import requireLocalAuth from './requireLocalAuth';
import canDeleteAccount from './canDeleteAccount';
import requireLdapAuth from './requireLdapAuth';
import abortMiddleware from './abortMiddleware';
import checkInviteUser from './checkInviteUser';
import requireJwtAuth from './requireJwtAuth';
import validateModel from './validateModel';
import moderateText from './moderateText';
import setHeaders from './setHeaders';
import validate from './validate';
import limiters from './limiters';
import uaParser from './uaParser';
import checkBan from './checkBan';
import noIndex from './noIndex';
import roles from './roles';

export default {
  ...abortMiddleware,
  ...validate,
  ...limiters,
  ...roles,
  noIndex,
  checkBan,
  uaParser,
  setHeaders,
  moderateText,
  validateModel,
  requireJwtAuth,
  checkInviteUser,
  requireLdapAuth,
  requireLocalAuth,
  canDeleteAccount,
  validateEndpoint,
  concurrentLimiter,
  checkDomainAllowed,
  validateMessageReq,
  buildEndpointOption,
  validateRegistration,
  validateImageRequest,
  validatePasswordReset,
};
