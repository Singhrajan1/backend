const createComment = asyncHandler(async (req, res) => {
  // 1. Get content from req.body — validate non-empty after trim (your usual pattern)

  // 2. Get video and post ids — likely from req.body or req.params, your call on route design
  //    e.g. POST /comments/video/:videoId  and  POST /comments/post/:postId  (two routes, one controller each)
  //    OR one route that takes either videoId or postId in the body — pick one, be deliberate

  // 3. Validate whichever id was provided with isValidObjectId

  // 4. Enforce exactly-one-target rule:
  //    - if both video and post are missing -> 400
  //    - if somehow both are provided -> 400 (shouldn't happen if your route design is clean, but defend anyway)

  // 5. (optional) verify the target video/post actually exists — same reasoning as channelExists in toggleSubscription

  // 6. owner from req.user._id (never from body)

  // 7. Create the Comment document with content, owner, and whichever target field applies

  // 8. Response — 201, created comment
});


const getVideoComments = asyncHandler(async (req, res) => {
  // 1. Get videoId from req.params, validate

  // 2. Query Comment.find({ video: videoId })
  //    - populate owner (username, avatar) — you need to know WHO wrote each comment
  //    - sort by createdAt — newest or oldest first? your call
  //    - consider .lean() — is this read-only? (yes) so same reasoning as getUserPosts

  // 3. Think about pagination — a popular video could have 100k+ comments.
  //    Do you want to implement skip/limit now, or leave as a TODO for later?
  //    (Not mandatory today given your time pressure — flag it as a known gap if skipped)

  // 4. Handle empty array as normal (not an error)

  // 5. Response
});


const getPostComments = asyncHandler(async (req, res) => {
  // same shape as getVideoComments, but filter by { post: postId } instead
  // question for you: could you have written ONE function handling both video and post
  // comments instead of two nearly-identical ones? think about how (hint: a shared 
  // helper taking a dynamic filter key) — not mandatory, but worth considering for later cleanup
});


const updateComment = asyncHandler(async (req, res) => {
  // 1. Get commentId from req.params, validate

  // 2. Get new content from req.body, validate non-empty

  // 3. Fetch the comment (findById)

  // 4. Exists check -> 404

  // 5. Ownership check -> 403 (same .toString() pattern as Post)

  // 6. Update content, save() (you already know why .save() here, not findByIdAndUpdate,
  //    since you already have the fetched document)

  // 7. Response
});


const deleteComment = asyncHandler(async (req, res) => {
  // 1. Get commentId, validate

  // 2. Fetch comment

  // 3. Exists check -> 404

  // 4. Ownership check -> 403
  //    (extra thought: should a VIDEO OWNER also be allowed to delete comments on their 
  //    own video, even if they didn't write the comment? Real YouTube allows this. 
  //    Optional stretch goal — skip for now if you want to move fast, but note it as a gap)

  // 5. Delete — instance method, same pattern as your fixed deletePost

  // 6. Response
});

export { createComment, getVideoComments, getPostComments, updateComment, deleteComment };