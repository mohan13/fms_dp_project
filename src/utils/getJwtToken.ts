import jwt from 'jsonwebtoken';

export const getJwtToken = (userId: string) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: '24h',
    },
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: '10d',
    },
  );
  return {
    accessToken,
    refreshToken,
  };
};
