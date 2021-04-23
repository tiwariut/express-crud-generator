/*******************************************************************************
 * Sample Routes
 ******************************************************************************/

"use strict";

const validator = require("express-joi-validator");
const mongoose = require("mongoose");
const Sample = mongoose.model("Sample");
const { details } = require("../transformers/samples");
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

const {
  createSample,
  getSamples,
  getSample,
  updateSample,
  deleteSample
} = require("../controllers/SampleController");

const {
  createSampleSchema,
  updateSampleSchema
} = require("../middleware/validations/samples");

module.exports = function(app) {
  app.post(
    "/api/v1/samples",
    protect,
    authorize("samples"),
    validator(createSampleSchema),
    function(req, res, next) {
      createSample(req, res, next);
    }
  );

  app.get(
    "/api/v1/samples",
    protect,
    authorize("samples"),
    advancedResults(Sample),
    function(req, res, next) {
      getSamples(req, res, next);
    }
  );

  app.get("/api/v1/samples/:id", protect, authorize("samples"), function(
    req,
    res,
    next
  ) {
    getSample(req, res, next);
  });

  app.put(
    "/api/v1/samples/:id",
    protect,
    authorize("samples"),
    validator(updateSampleSchema),
    function(req, res, next) {
      updateSample(req, res, next);
    }
  );

  app.delete("/api/v1/samples/:id", protect, authorize("samples"), function(
    req,
    res,
    next
  ) {
    deleteSample(req, res, next);
  });
};
