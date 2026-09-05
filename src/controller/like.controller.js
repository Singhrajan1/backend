const toggleLike = asyncHandler(async (req, res) => {
  // === Step 1: figure out which target type this request is for ===
  // Design decision: are you using ONE route like /likes/toggle/:targetType/:targetId
  //   (targetType = "video"|"comment"|"post" as a string, targetId = the actual id)
  // OR three separate routes each hitting their own controller function?
  // Given Option B schema (separate video/comment/post fields), THREE separate route params
  // is cleaner and avoids string-based type switching. Recommend:
  //   POST /likes/toggle/v/:videoId
  //   POST /likes/toggle/c/:commentId
  //   POST /likes/toggle/p/:postId
  // -> meaning you likely write toggleVideoLike, toggleCommentLike, togglePostLike
  //    as three separate functions with near-identical bodies (like getVideoComments/getPostComments)

  // Below is ONE of the three (video) fully spelled out — mirror this exact shape for comment and post.
});


const toggleVideoLike = asyncHandler(async (req, res) => {
  // 1. Get videoId from req.params, validate with isValidObjectId

  // 2. likedBy = req.user._id (never from body)

  // 3. (optional) verify video exists — Video.findById(videoId), 404 if not

  // 4. Check current state:
  //    const existingLike = await Like.findOne({ likedBy, video: videoId })

  // 5. Branch:
  //    a) existingLike exists -> await existingLike.deleteOne() -> respond { liked: false }
  //    b) doesn't exist -> await Like.create({ likedBy, video: videoId }) -> respond { liked: true }

  // 6. Response with ApiResponse, correct status code (200 for both branches, or 
  //    201 for the create branch — same debate as toggleSubscription, your call, be consistent)
});


const toggleCommentLike = asyncHandler(async (req, res) => {
  // Exact same shape as toggleVideoLike, but:
  // - param is commentId (from req.params)
  // - (optional) existence check against Comment.findById(commentId)
  // - filter/create use { likedBy, comment: commentId } instead of { video: videoId }
  // - everything else (branch logic, response shape) identical
});


const togglePostLike = asyncHandler(async (req, res) => {
  // Exact same shape again, but:
  // - param is postId
  // - (optional) existence check against Post.findById(postId)
  // - filter/create use { likedBy, post: postId }
});


// === Public counts — anyone can see how many likes something has ===

const getVideoLikesCount = asyncHandler(async (req, res) => {
  // 1. videoId from req.params, validate
  // 2. const count = await Like.countDocuments({ video: videoId })
  // 3. respond with the number — no auth needed for this one
});

const getCommentLikesCount = asyncHandler(async (req, res) => {
  // same shape, filter by { comment: commentId }
});

const getPostLikesCount = asyncHandler(async (req, res) => {
  // same shape, filter by { post: postId }
});


// === Optional but common: "has the current logged-in user liked this?" ===
// useful for frontend to show a filled vs outline heart icon on load

const isVideoLikedByUser = asyncHandler(async (req, res) => {
  // 1. videoId from req.params, validate
  // 2. likedBy = req.user._id (this one DOES need auth, since it's asking about a specific user)
  // 3. const existingLike = await Like.findOne({ likedBy, video: videoId })
  // 4. respond with { liked: !!existingLike }
  //    (!!existingLike converts a document-or-null into a clean true/false boolean —
  //    think about why this works: !null is true, !!null is false; 
  //    !someObject is false, !!someObject is true)
});

// same idea for comment/post if you want full parity — optional given time constraints

export {
  toggleVideoLike,
  toggleCommentLike,
  togglePostLike,
  getVideoLikesCount,
  getCommentLikesCount,
  getPostLikesCount,
  isVideoLikedByUser,
};