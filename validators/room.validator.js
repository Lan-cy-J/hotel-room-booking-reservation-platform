const Joi = require('joi');
const { HOUSEKEEPING_STATUS } = require('../utils/constants');

const createRoomSchema = {
  body: Joi.object({
    hotelId: Joi.string().hex().length(24).required(),
    roomTypeId: Joi.string().hex().length(24).required(),
    roomNumber: Joi.string().trim().required(),
    floor: Joi.number().integer().min(0).default(1),
    housekeepingStatus: Joi.string()
      .valid(...Object.values(HOUSEKEEPING_STATUS))
      .default(HOUSEKEEPING_STATUS.CLEAN)
  })
};

const updateRoomSchema = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required()
  }),
  body: Joi.object({
    roomNumber: Joi.string().trim(),
    floor: Joi.number().integer().min(0),
    housekeepingStatus: Joi.string().valid(...Object.values(HOUSEKEEPING_STATUS)),
    assignedStaffId: Joi.string().hex().length(24).allow(null),
    isActive: Joi.boolean()
  }).min(1)
};

const getRoomsQuerySchema = {
  query: Joi.object({
    hotelId: Joi.string().hex().length(24),
    roomTypeId: Joi.string().hex().length(24),
    housekeepingStatus: Joi.string().valid(...Object.values(HOUSEKEEPING_STATUS))
  })
};

module.exports = {
  createRoomSchema,
  updateRoomSchema,
  getRoomsQuerySchema
};
