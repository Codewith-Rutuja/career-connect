const Application = require("../models/Application");
const Message = require("../models/Message");
const { sendNotification } = require("../utils/notificationService");

const getDocumentId = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return value._id?.toString?.() || value.toString?.();
  }

  return null;
};

const isSameCompanyRecruiter = (user, job) => {
  return user?.role === "recruiter" && job?.companyName && user.companyName === job.companyName;
};

const isAuthorizedParticipant = (application, user) => {
  const applicantId = getDocumentId(application.applicant);
  const employerId = getDocumentId(application.job?.employer);
  const userId = getDocumentId(user?._id);

  return applicantId === userId || employerId === userId || isSameCompanyRecruiter(user, application.job);
};

const getMessageRecipientId = (application, user) => {
  const userId = getDocumentId(user?._id);
  const applicantId = getDocumentId(application.applicant);
  const employerId = getDocumentId(application.job?.employer);

  if (applicantId === userId) {
    return employerId;
  }

  return applicantId;
};

const getApplicationId = (req) => {
  const directId = req.params?.applicationId || req.params?.id;

  if (directId) {
    return directId;
  }

  const match = req.originalUrl?.match(/\/api\/apply\/([^/]+)(?:\/messages)?$/);
  return match?.[1] || null;
};

exports.getMessages = async (req, res, next) => {
  try {
    const applicationId = getApplicationId(req);
    const application = await Application.findById(applicationId).populate("job");
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    if (!isAuthorizedParticipant(application, req.user)) {
      return res.status(403).json({ message: "Access denied." });
    }

    const messages = await Message.find({ application: application._id })
      .populate("sender", "name role")
      .populate("recipient", "name role")
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const applicationId = getApplicationId(req);
    const content = req.body.content || req.body.message || "";

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content is required." });
    }

    const application = await Application.findById(applicationId).populate("job");
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    if (!isAuthorizedParticipant(application, req.user)) {
      return res.status(403).json({ message: "Access denied." });
    }

    const recipientId = getMessageRecipientId(application, req.user);

    const message = await Message.create({
      application: application._id,
      sender: req.user._id,
      recipient: recipientId,
      content: content.trim(),
      read: false,
    });

    await sendNotification({
      userId: recipientId,
      applicationId: application._id,
      type: "message",
      title: "New message from your hiring partner",
      message: content.trim(),
      data: { applicationId: application._id, type: "message" },
      email: null,
      sms: null,
    });

    res.status(201).json({ message: "Message sent.", data: message });
  } catch (error) {
    next(error);
  }
};

