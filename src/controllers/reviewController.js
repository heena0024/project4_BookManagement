const bookModel = require("../models/bookModel");
const reviewModel = require("../models/reviewModel");
const mongoose = require("mongoose");

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const isValidRequestBody = function (requestBody) {
  return Object.keys(requestBody).length > 0;
};

const isValidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId);
};

const isValidRating = function (rating) {
  return [1, 2, 3, 4, 5].indexOf(rating) > -1;
};
//////////////////////////////////     CREATE REVIEW /////////////////////
const createReview = async function (req, res) {
  try {
    const requestBody = req.body;
    const _id = req.params.bookId;
    let { reviewedBy, rating, review } = requestBody;

    if (!isValidObjectId(_id)) {
      res
        .status(400)
        .send({ status: false, message: "bookId should be valid" });
      return;
    }

    if (!isValidRequestBody(requestBody)) {
      res.status(400).send({
        status: false,
        message: "Please provide valid data in request body",
      });
      return;
    }

    let bookDetails = await bookModel.findOne({ _id, isDeleted: false });
    if (!bookDetails) {
      res
        .status(404)
        .send({ status: false, message: "No book exist with this ID" });
      return;
    }

    if (!isValid(rating)) {
      res.status(400).send({ status: false, message: "Rating is required" });
      return;
    }

    if (!isValidRating(rating)) {
      res
        .status(400)
        .send({ status: false, message: "Rating should be from 1 to 5" });
      return;
    }

    if (reviewedBy && !isValid(reviewedBy)) {
      res
        .status(400)
        .send({ status: false, message: "Reviewer's name should be valid" });
      return;
    }

    const reviewDetails = { reviewedBy, rating, review, bookId: _id };
    await reviewModel.create(reviewDetails);
    const reviews = bookDetails["reviews"] + 1;
    let updatedBookDetails = await bookModel.findOneAndUpdate(
      { _id },
      { reviews },
      { new: true }
    );
    const reviewDatas = await reviewModel.find({ bookId: _id });
    let data = { ...updatedBookDetails["_doc"], reviewData: reviewDatas };

    return res.status(200).send({
      status: true,
      message: "review created successfully",
      data: data,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

/////////////////////////////////UPDATE REVIEW ///////////////////////////
const updateReview = async function (req, res) {
  const requestBody = req.body;
  const _id = req.params.bookId;
  const reviewId = req.params.reviewId;

  if (!isValidObjectId(_id)) {
    res.status(400).send({ status: false, message: "bookId should be valid" });
    return;
  }
  if (!isValidObjectId(reviewId)) {
    res
      .status(400)
      .send({ status: false, message: "reviewId should be valid" });
    return;
  }

  if (!isValidRequestBody(requestBody)) {
    res.status(400).send({
      status: false,
      message: "Please provide valid data in request body",
    });
    return;
  }

  let bookDetails = await bookModel.findOne({ _id, isDeleted: false });
  if (!bookDetails) {
    res
      .status(404)
      .send({ status: false, message: "No book exist with this ID" });
    return;
  }

  let reviewDetails = await reviewModel.findOne({
    _id: reviewId,
    bookId: _id,
    isDeleted: false,
  });
  if (!reviewDetails) {
    res.status(404).send({
      status: false,
      message: "No review exist with this for this book ID",
    });
    return;
  }

  let { reviewedBy, rating, review } = requestBody;
  let updateData = {};

  if (reviewedBy) {
    if (!isValid(reviewedBy)) {
      res.status(400).send({
        status: false,
        message: "reviewedBy should have correct value",
      });
      return;
    }
    updateData["reviewedBy"] = reviewedBy;
  }
  if (rating) {
    if (!isValidRating(rating)) {
      res
        .status(400)
        .send({ status: false, message: "Rating should between 1 to 5" });
      return;
    }
    updateData["rating"] = rating;
  }
  if (review) {
    if (!isValid(review)) {
      res
        .status(400)
        .send({ status: false, message: "review should have correct value" });
      return;
    }
    updateData["review"] = review;
  }

  if (!isValidRequestBody(updateData)) {
    res.status(400).send({
      status: false,
      message: " please provide correct data in request body",
    });
    return;
  }

  await reviewModel.findOneAndUpdate({ _id: reviewId }, updateData);
  const reviewsData = await reviewModel.find({ bookId: _id, isDeleted: false });
  let data = { ...bookDetails["_doc"], reviewsData: reviewsData };

  return res.status(200).send({ status: true, data: data });
};

///////////////// DELETE REVIEW ////////////////////
const deleteReview = async function (req, res) {
  try {
    let b_id = req.params.bookId;
    if (!isValidObjectId(b_id)) {
      res
        .status(400)
        .send({ status: false, message: "bookid should be valid" });
      return;
    }

    let r_id = req.params.reviewId;
    if (!isValidObjectId(r_id)) {
      res
        .status(400)
        .send({ status: false, message: "reviewId should be valid" });
      return;
    }
    let bookRecord = await bookModel.findOne({ _id: b_id, isDeleted: false });
    if (!bookRecord) {
      res.status(404).send({
        status: false,
        message: "No book found corressponding to this id",
      });
      return;
    }
    let reviewRecord = await reviewModel.findOne({
      _id: r_id,
      isDeleted: false,
      bookId : b_id
    });

    if (!reviewRecord) {
      res.status(404).send({
        status: false,
        message: "No review found corressponding to this id",
      });
      return;
    }
    let deleteReview = await reviewModel.findOneAndUpdate(
      { _id: r_id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    let reviews = bookRecord.reviews
    let newReviews= reviews-1
    let updateBook = await bookModel.findOneAndUpdate(
      { _id: b_id, isDeleted: false },
      { reviews: newReviews },
      { new: true }
    );
   return res.status(200).send(updateBook);

  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createReview, updateReview, deleteReview };
