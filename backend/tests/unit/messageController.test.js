jest.mock("../../models/Application", () => ({
  findById: jest.fn(),
}));

jest.mock("../../models/Message", () => ({
  create: jest.fn(),
  find: jest.fn(),
}));

jest.mock("../../utils/notificationService", () => ({
  sendNotification: jest.fn(),
}));

const Application = require("../../models/Application");
const Message = require("../../models/Message");
const { sendNotification } = require("../../utils/notificationService");
const { getMessages, sendMessage } = require("../../controllers/messageController");

describe("messageController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("allows recruiters from the same company to fetch messages", async () => {
    Application.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: "app-1",
        applicant: "job-seeker-1",
        job: {
          employer: "employer-1",
          companyName: "Acme Labs",
        },
      }),
    });

    const sort = jest.fn().mockResolvedValue([{ _id: "message-1" }]);
    const populateRecip = jest.fn().mockReturnValue({ sort });
    const populateSender = jest.fn().mockReturnValue({ populate: populateRecip });
    Message.find.mockReturnValue({ populate: populateSender });

    const req = {
      params: { applicationId: "app-1" },
      user: { _id: "recruiter-1", role: "recruiter", companyName: "Acme Labs" },
    };
    const res = { json: jest.fn() };

    await getMessages(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({ messages: [{ _id: "message-1" }] });
  });

  it("supports the route param name used by applicationRoutes for message lookups", async () => {
    Application.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: "app-1",
        applicant: "job-seeker-1",
        job: {
          employer: "employer-1",
          companyName: "Acme Labs",
        },
      }),
    });

    const sort = jest.fn().mockResolvedValue([{ _id: "message-1" }]);
    const populateRecip = jest.fn().mockReturnValue({ sort });
    const populateSender = jest.fn().mockReturnValue({ populate: populateRecip });
    Message.find.mockReturnValue({ populate: populateSender });

    const req = {
      params: { id: "app-1" },
      user: { _id: "employer-1", role: "employer" },
    };
    const res = { json: jest.fn() };

    await getMessages(req, res, jest.fn());

    expect(Application.findById).toHaveBeenCalledWith("app-1");
    expect(res.json).toHaveBeenCalledWith({ messages: [{ _id: "message-1" }] });
  });

  it("allows recruiters from the same company to send messages and notify the job seeker", async () => {
    Application.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: "app-1",
        applicant: "job-seeker-1",
        job: {
          employer: "employer-1",
          companyName: "Acme Labs",
        },
      }),
    });

    Message.create.mockResolvedValue({
      _id: "message-1",
      content: "Hi, here is the meeting link https://meet.example.com/abc",
    });
    sendNotification.mockResolvedValue({ _id: "notification-1" });

    const req = {
      params: { applicationId: "app-1" },
      body: { content: " Hi, here is the meeting link https://meet.example.com/abc " },
      user: { _id: "recruiter-1", role: "recruiter", companyName: "Acme Labs" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await sendMessage(req, res, jest.fn());

    expect(Message.create).toHaveBeenCalledWith(
      expect.objectContaining({
        application: "app-1",
        sender: "recruiter-1",
        recipient: "job-seeker-1",
        content: "Hi, here is the meeting link https://meet.example.com/abc",
        read: false,
      })
    );
    expect(sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "job-seeker-1",
        applicationId: "app-1",
        type: "message",
        title: "New message from your hiring partner",
        message: "Hi, here is the meeting link https://meet.example.com/abc",
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Message sent.",
      })
    );
  });

  it("supports the route param name used by applicationRoutes when sending messages", async () => {
    Application.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: "app-1",
        applicant: "job-seeker-1",
        job: {
          employer: "employer-1",
          companyName: "Acme Labs",
        },
      }),
    });

    Message.create.mockResolvedValue({
      _id: "message-1",
      content: "Hello from employer",
    });
    sendNotification.mockResolvedValue({ _id: "notification-1" });

    const req = {
      params: { id: "app-1" },
      body: { content: "Hello from employer" },
      user: { _id: "employer-1", role: "employer" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await sendMessage(req, res, jest.fn());

    expect(Application.findById).toHaveBeenCalledWith("app-1");
    expect(Message.create).toHaveBeenCalledWith(
      expect.objectContaining({
        sender: "employer-1",
        recipient: "job-seeker-1",
      })
    );
  });

  it("handles populated application data when sending messages from a job seeker", async () => {
    Application.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: "app-1",
        applicant: { _id: "job-seeker-1" },
        job: {
          employer: { _id: "employer-1" },
          companyName: "Acme Labs",
        },
      }),
    });

    Message.create.mockResolvedValue({
      _id: "message-1",
      content: "Hi recruiter, I have a question about the role.",
    });
    sendNotification.mockResolvedValue({ _id: "notification-1" });

    const req = {
      params: { applicationId: "app-1" },
      body: { content: "Hi recruiter, I have a question about the role." },
      user: { _id: "job-seeker-1", role: "jobseeker" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await sendMessage(req, res, jest.fn());

    expect(Message.create).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient: "employer-1",
        sender: "job-seeker-1",
      })
    );
    expect(sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "employer-1",
      })
    );
  });
});
