const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
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
//////////////////////////////////////////////////
const createBook = async function (req, res) {
  try {
    const requestBody = req.body;
    let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } =
      requestBody;

    //validation starts here
    if (!isValidRequestBody(requestBody)) {
      res
        .status(400)
        .send({ status: false, message: "Please provide valid request body" });
      return;
    }
    if (!isValid(title)) {
      res.status(400).send({ status: false, message: "Title is required" });
      return;
    }
    title = String.prototype.trim.call(title);
    const isTitleAlreadyUsed = await bookModel.findOne({ title });

    if (isTitleAlreadyUsed) {
      res
        .status(400)
        .send({
          status: false,
          message: "Title is already in use, try something different",
        });
      return;
    }
    if (!isValid(excerpt)) {
      res.status(400).send({ status: false, message: "Excerpt is required" });
      return;
    }
    if (!isValid(userId)) {
      res.status(400).send({ status: false, message: "userId is required" });
      return;
    }

    if (!isValidObjectId(userId)) {
      res
        .status(400)
        .send({ status: false, message: "userId should be valid" });
      return;
    }

    if (!isValid(ISBN)) {
      res.status(400).send({ status: false, message: "ISBN is required" });
      return;
    }
    ISBN = String.prototype.trim.call(ISBN);
    const isIsbnAlreadyUsed = await bookModel.findOne({ ISBN });

    if (isIsbnAlreadyUsed) {
      res
        .status(400)
        .send({
          status: false,
          message: "ISBN is already in use, try something different",
        });
      return;
    }
    if (!isValid(category)) {
      res.status(400).send({ status: false, message: "category is required" });
      return;
    }
    if (!isValid(subcategory)) {
      res
        .status(400)
        .send({ status: false, message: "subcategory is required" });
      return;
    }

    if (!isValid(releasedAt)) {
      res
        .status(400)
        .send({ status: false, message: "releasedAt is required" });
      return;
    }

    if (!Date.parse(releasedAt)) {
      res
        .status(400)
        .send({
          status: false,
          message: `releasedAt should be an date and format("YYYY-MM-DD")`,
        });
      return;
    }

    const isUserExist = await userModel.findOne({ _id: userId });

    if (!isUserExist) {
      res.status(404).send({ status: false, message: "User doesn't exist" });
      return;
    }

    // validation ends here

    const reviews = 0;
    if (!(userId === req["userId"])) {
      res
        .status(401)
        .send({ status: false, message: "You are not authorised" });
      return;
    }
    const boodDetails = {
      title,
      excerpt,
      userId,
      ISBN,
      category,
      subcategory,
      reviews,
      releasedAt,
    };
    const ceatedBook = await bookModel.create(boodDetails);

    return res
      .status(201)
      .send({ status: true, message: "Success", data: ceatedBook });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
///////////////////////////////////////////////////////////
const getBooks = async function (req, res) {
  try {
    const requestQuery = req.query;
    let filter = {
      isDeleted: false, //_id, title, excerpt, userId, category, releasedAt, reviews
    };
    const { userId, category, subcategory } = requestQuery;

    if (userId) {
      filter["userId"] = userId;
    }
    if (category) {
      filter["category"] = category;
    }
    if (subcategory) {
      filter["subcategory"] = subcategory;
    }

    const bookData = await bookModel
      .find(filter)
      .select({
        deletedAt: 0,
        isDeleted: 0,
        subcategory: 0,
        ISBN: 0,
        createdAt: 0,
        updatedAt: 0,
      });
    const bookDetails = bookData.sort(function (a, b) {
      a["title"].toLowerCase() < b["title"].toLowerCase() ? 1 : -1;
    });
    return res
      .status(200)
      .send({ status: true, message: "Books list", data: bookDetails });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const getBooksById = async function (req, res) {
  const _id = req.params.bookId;

  if (!isValidObjectId(_id)) {
    res.status(400).send({ status: false, message: "bookId should be valid" });
    return;
  }

  let bookDetails = await bookModel.findOne({ _id, isDeleted: false });
  if (!bookDetails) {
    res.status(404).send({ status: false, message: "No book found" });
    return;
  }
  const {
    title,
    excerpt,
    userId,
    ISBN,
    category,
    subcategory,
    releasedAt,
    deletedAt,
    isDeleted,
    updatedAt,
    reviews,
    createdAt,
  } = bookDetails;
  const reviewData = await reviewModel.find({ bookId: _id, isDeleted: false });
  const book = {
    _id,
    reviews,
    title,
    excerpt,
    userId,
    ISBN,
    category,
    subcategory,
    reviewsData: reviewData,
    releasedAt,
    deletedAt,
    isDeleted,
    updatedAt,
    createdAt,
  };
  return res
    .status(200)
    .send({ status: true, message: "Books list", data: book });
};
//////////////////////////////////////////////////////
const updateBook = async function (req, res) {
  try {
    const _id = req.params.bookId;
    const requestBody = req.body;

    if (!isValidObjectId(_id)) {
      res
        .status(400)
        .send({ status: false, message: "bookId should be valid" });
      return;
    }

    
    if (!isValidRequestBody(requestBody)) {
        res
          .status(400)
          .send({
            status: false,
            message: "Please provide valid data in request body",
          });
        return;
      }
  

    let bookDetails = await bookModel.findOne({ _id, isDeleted: false });
    if (!bookDetails) {
      res.status(404).send({ status: false, message: "No book found" });
      return;
    }
    let { title, excerpt, ISBN, releasedAt } = requestBody;
    let updateData = {};

    if (title) {
      if (!isValid(title)) {
        res
          .status(400)
          .send({ status: false, message: "Title should have some value" });
        return;
      }

      title = String.prototype.trim.call(title);
      let isTitleAlreadyUsed = await bookModel.findOne({ title });

      if (isTitleAlreadyUsed && !(bookDetails['title'] == title)) {
        res
          .status(400)
          .send({
            status: false,
            message: "Title is already in use, try something different",
          });
        return;
      }
      updateData["title"] = title;
    }
    if (excerpt) {
      if (!isValid(excerpt)) {
        res
          .status(400)
          .send({ status: false, message: "excerpt should have some value" });
        return;
      }
      updateData["excerpt"] = excerpt;
    }
    if (ISBN) {
      if (!isValid(ISBN)) {
        res
          .status(400)
          .send({ status: false, message: "ISBN should have some value" });
        return;
      }

      ISBN = String.prototype.trim.call(ISBN);
      let isIsbnAlreadyUsed = await bookModel.findOne({ ISBN });

      if (isIsbnAlreadyUsed && !(bookDetails['ISBN'] == ISBN)) {
        res
          .status(400)
          .send({
            status: false,
            message: "ISBN is already in use, try something different",
          });
        return;
      }
      updateData["ISBN"] = ISBN;
    }
    if (releasedAt) {
      if (!Date.parse(releasedAt)) {
        res
          .status(400)
          .send({
            status: false,
            message: `releasedAt should be an date and format("YYYY-MM-DD")`,
          });
        return;
      }
      updateData["releasedAt"] = releasedAt;
    }

    if (!isValidRequestBody(updateData)) {
      res
        .status(400)
        .send({
          status: false,
          message: "Please provide correct updating data ",
        });
      return;
    }

    if (!(bookDetails["userId"] == req["userId"])) {
      res
        .status(401)
        .send({
          status: false,
          message: "You are not authorised"
        });
      return;
    }
    let udatedBookDetails = await bookModel.findOneAndUpdate(
      { _id },
      updateData,
      { new: true }
    );
    return res
      .status(200)
      .send({
        status: true,
        message: "Book details updated successfully",
        data: udatedBookDetails,
      });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const deleteBook = async function (req, res) {
    try {
      const _id = req.params.bookId;
      if (!isValidObjectId(_id)) {
        res
          .status(400)
          .send({ status: false, message: "bookId should be valid" });
        return;
      }
  
      let bookDetails = await bookModel.findOne({ _id, isDeleted: false });
      if (!bookDetails) {
        res.status(404).send({ status: false, message: "No book found" });
        return;
      }

      if (!(bookDetails["userId"] == req["userId"])) {
        res
          .status(401)
          .send({
            status: false,
            message: "You are not authorised"
           
          });
        return;
      }

      let udatedBookDetails = await bookModel.findOneAndUpdate(
        { _id },
       {isDeleted : true,
        deletedAt: new Date()}
      );
      return res
        .status(200)
        .send({
          status: true,
          message: "Book deleted successfully"
        });

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}
module.exports = { createBook, getBooks, getBooksById, updateBook, deleteBook }