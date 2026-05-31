const { protect } = require('../../middleware/authMiddleware');
const User = require('../../models/User');
const { verifyToken } = require('../../utils/jwt');

jest.mock('../../models/User');
jest.mock('../../utils/jwt');

describe('Auth Middleware - unit tests', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('returns 401 when authorization header is missing', async () => {
    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authorization token is missing.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is invalid', async () => {
    req.headers.authorization = 'Bearer invalid-token';
    verifyToken.mockImplementation(() => { const err = new Error('jwt malformed'); err.name = 'JsonWebTokenError'; throw err; });

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when token is valid and user exists', async () => {
    req.headers.authorization = 'Bearer valid-token';
    verifyToken.mockReturnValue({ id: 'user-id' });
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: 'user-id', email: 'test@example.com' }) });

    await protect(req, res, next);

    expect(req.user).toEqual({ _id: 'user-id', email: 'test@example.com' });
    expect(next).toHaveBeenCalled();
  });
});
