"use strict";

module.exports = {
  details: function(data) {
    if (Array.isArray(data)) {
      return data.map(sample => {
        return {
          /* List Data */
        };
      });
    } else {
      return {
        _id: data._id,
        /* Single Data */
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    }
  }
};
