const AppError = require('./appError');

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedDFields = ['page', 'sort', 'limit', 'fields'];
    excludedDFields.forEach((el) => delete queryObj[el]);

    const queryStr = JSON.stringify(queryObj);
    const editQuery = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const advancedFilterObject = JSON.parse(editQuery);
    this.query.find(advancedFilterObject);
    return this;
    // let query = Tour.find(advancedFilterObject);
  }

  sorted() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  fields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  async pagination(arr) {
    // const firstEl = (req.query.page - 1) * req.query.limit + 1;
    // const lastEl = req.query.page * req.query.limit;
    //  query = await query.slice(firstEl,lastEl)
    const skip = (this.queryString.page - 1) * this.queryString.limit;
    this.query = this.query.skip(skip).limit(+this.queryString.limit);
    const numTours = await arr.countDocuments();
    if (skip >= numTours) throw new AppError('Page not found', 404);
    return this;
  }
}
module.exports = APIFeatures;
