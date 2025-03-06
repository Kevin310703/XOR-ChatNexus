import { model } from 'mongoose';
import userSchema from '~/models/schema/userSchema';

const User = model('User', userSchema);

export default User;
