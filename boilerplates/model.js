/*******************************************************************************
 * Sample Model
 ******************************************************************************/

"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SampleSchema = new Schema(
  {
    /* Fields */
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sample", SampleSchema);
