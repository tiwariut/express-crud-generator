/*******************************************************************************
 * Sample Controller
 ******************************************************************************/

"use strict";

const mongoose = require("mongoose");
const ErrorResponse = require("../utils/error-response");
const asyncHandler = require("../middleware/async");
const Sample = mongoose.model("Sample");
const { details } = require("../transformers/samples");

// @desc      Create sample
// @route     POST /api/v1/samples
// @access    Private/samples
exports.createSample = asyncHandler(async (req, res, next) => {
  const msgs = res.__("samples");

  const sample = new Sample(req.body);

  await sample.save();

  res.status(200).send({
    success: true,
    message: msgs.sampleCreated,
    data: {}
  });
});

// @desc      Get all samples
// @route     GET /api/v1/samples
// @access    Private/samples
exports.getSamples = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single sample
// @route     GET /api/v1/samples/:id
// @access    Private/samples
exports.getSample = asyncHandler(async (req, res, next) => {
  const msgs = res.__("samples");

  const { id } = req.params;

  const sample = await Sample.findById(id);

  if (!sample) {
    return next(new ErrorResponse(`${msgs.notFound} ${id}.`, 404));
  }

  res.status(200).json({
    success: true,
    message: msgs.sampleFound,
    data: details(sample)
  });
});

// @desc      Update sample
// @route     PUT /api/v1/samples/:id
// @access    Private/samples
exports.updateSample = asyncHandler(async (req, res, next) => {
  const msgs = res.__("samples");

  const { /* Update Fields */ } = req.body;

  const { id } = req.params;

  const sample = await Sample.findById(id);

  if (!sample) {
    return next(new ErrorResponse(`${msgs.notFound} ${id}.`, 404));
  }

  /* Update Logic */

  await sample.save();

  res.status(200).json({
    success: true,
    message: msgs.sampleUpdated,
    data: {}
  });
});

// @desc      Delete sample
// @route     DELETE /api/v1/samples/:id
// @access    Private/samples
exports.deleteSample = asyncHandler(async (req, res, next) => {
  const msgs = res.__("samples");

  const { id } = req.params;

  const sample = await Sample.findById(id);

  if (!sample) {
    return next(new ErrorResponse(`${msgs.notFound} ${id}.`, 404));
  }

  await sample.remove();

  res.status(200).json({
    success: true,
    message: msgs.sampleDeleted,
    data: {}
  });
});
