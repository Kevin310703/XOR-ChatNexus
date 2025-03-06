import { PermissionTypes, Permissions } from 'librechat-data-provider';
import { Schema, model } from 'mongoose';

const roleSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  [PermissionTypes.BOOKMARKS]: {
    [Permissions.USE]: {
      type: Boolean,
      default: true,
    },
  },
  [PermissionTypes.PROMPTS]: {
    [Permissions.SHARED_GLOBAL]: {
      type: Boolean,
      default: false,
    },
    [Permissions.USE]: {
      type: Boolean,
      default: true,
    },
    [Permissions.CREATE]: {
      type: Boolean,
      default: true,
    },
  },
  [PermissionTypes.AGENTS]: {
    [Permissions.SHARED_GLOBAL]: {
      type: Boolean,
      default: false,
    },
    [Permissions.USE]: {
      type: Boolean,
      default: true,
    },
    [Permissions.CREATE]: {
      type: Boolean,
      default: true,
    },
  },
  [PermissionTypes.MULTI_CONVO]: {
    [Permissions.USE]: {
      type: Boolean,
      default: true,
    },
  },
  [PermissionTypes.TEMPORARY_CHAT]: {
    [Permissions.USE]: {
      type: Boolean,
      default: true,
    },
  },
  [PermissionTypes.RUN_CODE]: {
    [Permissions.USE]: {
      type: Boolean,
      default: true,
    },
  },
});

const Role = model('Role', roleSchema);

export default Role;
