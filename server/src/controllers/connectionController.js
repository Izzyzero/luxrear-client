import Connection from '../models/Connection.js';
import Profile from '../models/Profile.js';
import User from '../models/User.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';
import { createNotification } from '../utils/notificationService.js';

export const sendConnectionRequest = async (req, res, next) => {
  try {
    const { receiver_id } = req.body;

    const requesterProfile = await Profile.findOne({ user_id: req.user._id });
    if (!requesterProfile) {
      return errorResponse(res, 404, 'Profile not found.');
    }

    if (requesterProfile._id.toString() === receiver_id) {
      return errorResponse(res, 400, 'You cannot connect with yourself.');
    }

    const receiverProfile = await Profile.findById(receiver_id);
    if (!receiverProfile) {
      return errorResponse(res, 404, 'Receiver profile not found.');
    }

    const existing = await Connection.findOne({
      $or: [
        { requester_id: requesterProfile._id, receiver_id },
        { requester_id: receiver_id, receiver_id: requesterProfile._id },
      ],
    });

    if (existing) {
      if (existing.status === 'pending') {
        return errorResponse(res, 400, 'Connection request already sent.');
      }
      if (existing.status === 'accepted') {
        return errorResponse(res, 400, 'Already connected.');
      }
      if (existing.status === 'blocked') {
        return errorResponse(res, 403, 'Unable to send request.');
      }
      existing.status = 'pending';
      await existing.save();

      const receiverUser = await User.findById(receiverProfile.user_id);
      if (receiverUser) {
        await createNotification({
          user_id: receiverUser._id,
          type: 'connection_request',
          message: `${requesterProfile.full_name || 'A member'} sent you a connection request.`,
          reference_id: requesterProfile._id,
          reference_type: 'Connection',
        });
      }

      return successResponse(res, 200, 'Connection request sent.', { connection: existing });
    }

    const connection = await Connection.create({
      requester_id: requesterProfile._id,
      receiver_id,
    });

    const receiverUser2 = await User.findById(receiverProfile.user_id);
    if (receiverUser2) {
      await createNotification({
        user_id: receiverUser2._id,
        type: 'connection_request',
        message: `${requesterProfile.full_name || 'A member'} sent you a connection request.`,
        reference_id: requesterProfile._id,
        reference_type: 'Connection',
      });
    }

    return successResponse(res, 201, 'Connection request sent.', { connection });
  } catch (error) {
    next(error);
  }
};

export const respondToRequest = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return errorResponse(res, 400, 'Status must be accepted or rejected.');
    }

    const profile = await Profile.findOne({ user_id: req.user._id });
    if (!profile) {
      return errorResponse(res, 404, 'Profile not found.');
    }

    const connection = await Connection.findById(req.params.id);
    if (!connection) {
      return errorResponse(res, 404, 'Connection request not found.');
    }

    if (connection.receiver_id.toString() !== profile._id.toString()) {
      return errorResponse(res, 403, 'This request was not sent to you.');
    }

    if (connection.status !== 'pending') {
      return errorResponse(res, 400, `Request already ${connection.status}.`);
    }

    connection.status = status;
    await connection.save();

    if (status === 'accepted') {
      const requesterProfile = await Profile.findById(connection.requester_id);
      const requesterUser = await User.findById(requesterProfile.user_id);
      if (requesterUser) {
        await createNotification({
          user_id: requesterUser._id,
          type: 'connection_accepted',
          message: `${profile.full_name || 'A member'} accepted your connection request.`,
          reference_id: profile._id,
          reference_type: 'Connection',
        });
      }
    }

    return successResponse(res, 200, `Connection ${status}.`, { connection });
  } catch (error) {
    next(error);
  }
};

export const getMyConnections = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const profile = await Profile.findOne({ user_id: req.user._id });
    if (!profile) {
      return errorResponse(res, 404, 'Profile not found.');
    }

    const filter = {
      $or: [
        { requester_id: profile._id },
        { receiver_id: profile._id },
      ],
    };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [connections, total] = await Promise.all([
      Connection.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('requester_id', 'full_name business_name profile_picture industry location')
        .populate('receiver_id', 'full_name business_name profile_picture industry location'),
      Connection.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / parseInt(limit));

    const data = connections.map((c) => {
      const conn = c.toObject();
      const isRequester = c.requester_id._id.toString() === profile._id.toString();
      conn.other_profile = isRequester ? c.receiver_id : c.requester_id;
      conn.direction = isRequester ? 'sent' : 'received';
      return conn;
    });

    return paginatedResponse(res, 'Connections fetched.', data, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages,
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingRequests = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user_id: req.user._id });
    if (!profile) {
      return errorResponse(res, 404, 'Profile not found.');
    }

    const requests = await Connection.find({
      receiver_id: profile._id,
      status: 'pending',
    })
      .sort({ created_at: -1 })
      .populate('requester_id', 'full_name business_name profile_picture industry location');

    return successResponse(res, 200, 'Pending requests fetched.', { requests });
  } catch (error) {
    next(error);
  }
};

export const removeConnection = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user_id: req.user._id });
    if (!profile) {
      return errorResponse(res, 404, 'Profile not found.');
    }

    const connection = await Connection.findById(req.params.id);
    if (!connection) {
      return errorResponse(res, 404, 'Connection not found.');
    }

    const isParticipant =
      connection.requester_id.toString() === profile._id.toString() ||
      connection.receiver_id.toString() === profile._id.toString();

    if (!isParticipant) {
      return errorResponse(res, 403, 'You are not part of this connection.');
    }

    connection.status = 'rejected';
    await connection.save();

    return successResponse(res, 200, 'Connection removed.');
  } catch (error) {
    next(error);
  }
};
