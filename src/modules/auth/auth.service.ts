import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ApiError } from '../../utils/ApiError.ts';
import { authRepository } from './auth.repository.ts';

export const authService = {
  // Add your authentication service methods here
  register: async (userData: {
    username: string;
    email: string;
    password: string;
  }) => {
    if (userData === undefined) {
      throw new ApiError(400, 'Data cant be empty');
    }
    const existing = await authRepository.findByEmail(userData.email);
    if (existing) throw new ApiError(400, 'Email already in use');
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const user = await authRepository.create({
      ...userData,
      password: hashedPassword,
      name: '',
    });
    const { password: _password, ...safeUser } = user;
    return { user: safeUser };
  },

  login: async (email: string, password: string) => {
    const user = await authRepository.findByEmail(email);
    if (!user) throw new ApiError(404, "User with given email doesn't exists");
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new ApiError(401, 'Invalid Credentials');
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '15m',
      },
    );
    const { password: _password, ...safeUser } = user;
    return { user: safeUser, token };
  },
};
