import express from 'express';
import { checkPassword, findAllUsers, findOneUser, register, updateUser } from '../controllers/user.js';
import { authorize } from '../middlewares/authorize.js';
import { authenticate } from '../middlewares/authenticate.js';
import { pagination } from '../middlewares/pagination.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { validateRegister } from '../middlewares/validator.js';
const router = express.Router();

router
.route('/')
.post(authLimiter, validateRegister, register)
.get(authenticate, authorize, pagination, findAllUsers)

router
.route('/update')
.put(authenticate, checkPassword, updateUser)

router
.route('/:id')
.get(authenticate, authorize, findOneUser)

export default router;