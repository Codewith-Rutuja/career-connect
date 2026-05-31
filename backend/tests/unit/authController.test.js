const User = require("../../models/User");
const { signToken } = require("../../utils/jwt");
const { registerUser, loginUser } = require("../../controllers/authController");

jest.mock("../../models/User");
jest.mock("../../utils/jwt");

describe("Auth Controller - unit tests", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    signToken.mockReturnValue("test-token");
  });

  it("returns 400 when registration payload is incomplete", async () => {
    req.body = { name: "Test" };

    await registerUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Please fill all required fields." });
  });

  it("returns 400 when user already exists", async () => {
    req.body = { name: "Test", email: "test@example.com", password: "pass", role: "jobseeker" };
    User.findOne.mockResolvedValue({ email: "test@example.com" });

    await registerUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "User already exists." });
  });

  it("creates a new user and returns a token on registration", async () => {
    req.body = { name: "Test", email: "test@example.com", password: "pass", role: "jobseeker" };
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      _id: "user-id",
      name: "Test",
      email: "test@example.com",
      role: "jobseeker",
      skills: [],
      headline: "",
      location: "",
      resumeText: "",
      resumeFile: "",
      education: "",
      experience: "",
      companyName: "",
      companyDescription: "",
    });

    await registerUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Registration successful.",
      token: "test-token",
      user: expect.objectContaining({ email: "test@example.com" }),
    }));
  });

  it("returns 401 when login payload is incomplete", async () => {
    req.body = { email: "" };

    await loginUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Email and password are required." });
  });
});
