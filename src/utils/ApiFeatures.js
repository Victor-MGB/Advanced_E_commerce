export class ApiFeatures {
  constructor(mongooseQuery, queryString = {}) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
    this.filterObj = {};
    this.page = 1;
    this.limit = 0;
    this.total = 0;
  }

  pagination() {
    const limit = Number(this.queryString.limit) || 10;
    this.limit = Math.min(Math.max(limit, 1), 100);
    this.page = Math.max(Number(this.queryString.page) || 1, 1);

    this.mongooseQuery
      .skip((this.page - 1) * this.limit)
      .limit(this.limit);

    return this;
  }

  filteration() {
    const filterObj = { ...this.queryString };
    const excluded = ["page", "limit", "sort", "fields", "keyword"];
    excluded.forEach((key) => delete filterObj[key]);

    const withOperators = JSON.stringify(filterObj).replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`
    );

    this.filterObj = JSON.parse(withOperators);
    this.mongooseQuery.find(this.filterObj);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      this.mongooseQuery.sort(this.queryString.sort.split(",").join(" "));
    }
    return this;
  }

  search() {
    if (this.queryString.keyword) {
      const keyword = this.queryString.keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchObj = {
        $or: ["title", "description", "name", "email", "comment", "code"].map(
          (field) => ({ [field]: { $regex: keyword, $options: "i" } })
        ),
      };

      this.filterObj = Object.keys(this.filterObj).length
        ? { $and: [this.filterObj, searchObj] }
        : searchObj;
      this.mongooseQuery.find(this.filterObj);
    }
    return this;
  }

  fields() {
    if (this.queryString.fields) {
      this.mongooseQuery.select(this.queryString.fields.split(",").join(" "));
    }
    return this;
  }

  async countTotal() {
    this.total = await this.mongooseQuery.model.countDocuments(this.filterObj);
    return this.total;
  }
}
