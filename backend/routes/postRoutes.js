const express = require("express");
const router = express.Router();
const multer = require("multer");
const postController = require("../controllers/postController");
const { isAuthenticated } = require("../middlewares/auth");

// Setup multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});


const upload = multer({ storage });

// --- ROUTES --- //
router.get("/", postController.getAll);

// `upload.single("image")` here
router.post("/", isAuthenticated, upload.single("image"), postController.create);

router.put("/:id", isAuthenticated, postController.update);
router.delete("/:id", isAuthenticated, postController.remove);
router.post("/:postId/comments", isAuthenticated, postController.addComment);
router.patch("/:postId/comments/:commentId", isAuthenticated, postController.editComment);
router.delete("/:postId/comments/:commentId", isAuthenticated, postController.deleteComment);
router.patch("/:id/like", isAuthenticated, postController.like);
router.patch("/:id/dislike", isAuthenticated, postController.dislike);
module.exports = router;



