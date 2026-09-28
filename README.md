# Build a Production-Ready Frontend for This Existing Backend

You are an expert senior frontend/full-stack engineer.

I am providing an existing Node.js + Express + MongoDB backend. Your task is to build a complete, professional frontend that works directly with this backend.

**Do NOT create a generic mock YouTube UI.**

Before writing the frontend, inspect the provided backend source code carefully and derive the complete API contract from:

- `src/app.js`
- `src/routes/*`
- `src/controller/*`
- `src/model/*`
- `src/middlewares/*`
- authentication/token logic
- request body fields
- query parameters
- route parameters
- file upload requirements
- response structures
- authentication requirements
- ownership restrictions
- error responses

The backend is the source of truth.

---

# 1. Core Requirement

Create a complete video-sharing/social platform frontend where **every backend route that can be used by a frontend is actually integrated into the UI.**

There must be:

- no fake API responses
- no hardcoded videos
- no fake users
- no fake comments
- no fake likes
- no fake playlists
- no fake subscriber counts
- no placeholder backend functions
- no TODO API integrations
- no buttons that visually work but do nothing
- no UI feature that is disconnected from the backend

Every button, form, upload, interaction, navigation action, and user operation should call the appropriate backend API.

If a backend endpoint exists, determine where it belongs in the UI and implement it.

---

# 2. Technology

Use:

- React
- Vite
- JavaScript or TypeScript
- React Router
- Axios or a clean Fetch-based API client
- modern component architecture
- reusable components
- responsive CSS
- professional UI
- accessible form controls
- proper loading/error/empty states

Do not introduce unnecessary frameworks.

Create a centralized API layer instead of making random HTTP requests throughout components.

Recommended structure:

```text
src/
├── api/
│   ├── client
│   ├── authApi
│   ├── videoApi
│   ├── userApi
│   ├── commentApi
│   ├── likeApi
│   ├── playlistApi
│   ├── postApi
│   └── subscriptionApi
│
├── components/
├── pages/
├── layouts/
├── hooks/
├── context/
├── utils/
├── routes/
└── App
```

---

# 3. Backend Base Routes

The backend mounts these route groups:

```text
/api/v1/users
/api/v1/videos
/api/v1/playlists
/api/v1/subscriptions
/api/v1/posts
/api/v1/comments
/api/v1/likes
```

Create a configurable environment variable:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Do not hardcode the production API URL throughout the application.

---

# 4. Authentication

Implement the complete authentication lifecycle.

## Registration

Backend:

```http
POST /api/v1/users/register
```

Multipart form data:

```text
fullname
email
username
password
avatar
coverImage
```

Avatar is required.

Build a professional registration page with:

- fullname
- username
- email
- password
- confirm password
- avatar upload
- optional cover image upload
- image previews
- validation
- upload progress where practical
- backend error handling

---

## Login

```http
POST /api/v1/users/login
```

Support:

```text
username OR email
password
```

Build a proper login screen.

After successful authentication:

- store authentication state
- fetch current user
- redirect appropriately
- persist session correctly
- handle expired authentication

The backend uses cookies and also returns access/refresh tokens.

Configure Axios/fetch correctly for credentials:

```js
withCredentials: true;
```

Do not accidentally omit cookies.

---

## Logout

```http
POST /api/v1/users/logout
```

Add logout to the user menu.

After logout:

- clear frontend auth state
- clear cached user data
- redirect to an appropriate public page

---

## Refresh Token

```http
POST /api/v1/users/refreshToken
```

Implement automatic token/session recovery.

The API client should be capable of handling an expired access token without forcing the user to manually log in unnecessarily.

Avoid infinite refresh loops.

---

## Current User

```http
GET /api/v1/users/current-user
```

Use this when initializing the application/session.

---

# 5. User Account

Implement:

```http
POST /api/v1/users/change-password
PATCH /api/v1/users/update-account
PATCH /api/v1/users/avatar
PATCH /api/v1/users/cover-image
```

Create a professional settings/account section.

## Account settings

Allow:

- update fullname
- update email
- change password
- update avatar
- update cover image

Show:

- loading states
- success messages
- backend validation errors
- upload previews
- confirmation where destructive/action-sensitive behavior requires it

---

# 6. Channel/Profile

Backend:

```http
GET /api/v1/users/c/:username
```

Create a channel page containing:

- cover image
- avatar
- fullname
- username
- subscriber count
- subscribed channel count
- subscription state
- subscribe/unsubscribe button
- videos
- posts
- channel information

The profile must use real backend data.

Do not invent subscriber counts.

---

# 7. Video System

Backend:

```http
POST /api/v1/videos
GET /api/v1/videos
GET /api/v1/videos/:videoId
DELETE /api/v1/videos/:videoId
```

## Home / Video Feed

Use:

```http
GET /api/v1/videos
```

Support all backend query parameters:

```text
page
limit
query
sortBy
sortType
userId
```

The UI should provide:

- search
- pagination
- sorting
- filtering
- video cards
- creator information
- thumbnails
- duration
- views
- upload date
- loading skeletons
- empty state
- error state

Supported sorting fields:

```text
createdAt
title
views
duration
```

Supported direction:

```text
asc
desc
```

---

# 8. Search

Create a global search experience.

When the user searches for a video, use:

```http
GET /api/v1/videos?query=...
```

Do not perform fake frontend-only filtering.

Search should actually query the backend.

Support:

- search suggestions if appropriate
- loading state
- no-result state
- pagination
- sorting

---

# 9. Video Upload

Create a professional creator upload page.

Backend expects:

```http
POST /api/v1/videos
```

Multipart fields:

```text
title
description
videoFile
thumbnail
```

Both video and thumbnail are required.

UI must include:

- drag-and-drop upload
- video file selector
- thumbnail selector
- thumbnail preview
- video preview when possible
- title
- description
- validation
- upload state
- progress indicator if supported
- success state
- backend error display

After successful upload, update the UI without requiring a full browser refresh.

---

# 10. Video Player Page

Create a professional watch page.

Use:

```http
GET /api/v1/videos/:videoId
```

Display:

- video player
- title
- description
- creator
- creator avatar
- views
- upload date
- like button
- like count
- subscription button
- comments
- playlists
- related videos
- creator navigation

When appropriate, add the video to watch history:

```http
POST /api/v1/users/history/:videoId
```

Do not count views artificially from the frontend because the backend currently does not expose a frontend route for incrementing views.

---

# 11. Video Delete

Authenticated video owners can delete their own videos:

```http
DELETE /api/v1/videos/:videoId
```

Only show the delete control when the logged-in user owns the video.

Use a confirmation dialog.

After deletion:

- update frontend state
- redirect appropriately
- show success/error feedback

Do not expose destructive actions to unauthorized users.

---

# 12. Comments

Backend:

```http
POST /api/v1/comments/video/:videoId
GET /api/v1/comments/video/:videoId

POST /api/v1/comments/post/:postId
GET /api/v1/comments/post/:postId

PATCH /api/v1/comments/:commentId
DELETE /api/v1/comments/:commentId
```

Create a reusable comments component.

Support:

- create comment
- display comments
- edit own comment
- delete own comment
- loading state
- empty state
- backend errors
- comment like functionality

The same comment system must work for both videos and posts.

---

# 13. Likes

Backend:

```http
POST /api/v1/likes/toggle/video/:videoId
POST /api/v1/likes/toggle/comment/:commentId
POST /api/v1/likes/toggle/post/:postId

GET /api/v1/likes/count/video/:videoId
GET /api/v1/likes/count/comment/:commentId
GET /api/v1/likes/count/post/:postId

GET /api/v1/likes/status/video/:videoId
GET /api/v1/likes/status/comment/:commentId
GET /api/v1/likes/status/post/:postId
```

Implement real like functionality.

For each supported entity:

1. Fetch count.
2. Fetch current user's like status when authenticated.
3. Toggle the like.
4. Update the UI correctly.
5. Handle unauthenticated users appropriately.

Implement likes for:

- videos
- comments
- posts

Avoid unnecessary duplicate API requests.

---

# 14. Subscriptions

Backend:

```http
POST /api/v1/subscriptions/toggle/:channelId
GET /api/v1/subscriptions/subscribed-channels
GET /api/v1/subscriptions/subscribers/:channelId
```

Implement:

## Subscribe/unsubscribe

Use:

```http
POST /api/v1/subscriptions/toggle/:channelId
```

Update:

- subscription state
- subscriber count
- button state

## Subscribed channels

Create a subscriptions page:

```http
GET /api/v1/subscriptions/subscribed-channels
```

Display:

- channel avatar
- channel name
- username
- navigation to channel

## Subscribers

For a channel owner, support the subscriber list returned by:

```http
GET /api/v1/subscriptions/subscribers/:channelId
```

For other viewers, correctly handle the backend response, which returns the subscriber count.

Do not assume the response is always an array.

---

# 15. Playlists

Backend:

```http
POST /api/v1/playlists
GET /api/v1/playlists/user/:userId
GET /api/v1/playlists/:playlistId
PATCH /api/v1/playlists/:playlistId
DELETE /api/v1/playlists/:playlistId

POST /api/v1/playlists/:playlistId/videos/:videoId
DELETE /api/v1/playlists/:playlistId/videos/:videoId
```

Build a complete playlist system.

Features:

- create playlist
- view playlists
- view playlist details
- edit playlist name
- edit description
- delete playlist
- add video to playlist
- remove video from playlist
- open/watch playlist videos
- playlist video count

On the video page provide:

```text
Save to playlist
```

with a professional playlist-selection modal.

Only allow owners to perform owner-only actions.

---

# 16. Posts / Community

Backend:

```http
POST /api/v1/posts
GET /api/v1/posts/all
GET /api/v1/posts/user/:userId
PATCH /api/v1/posts/:postId
DELETE /api/v1/posts/:postId
```

Implement a community/posts section.

## Create post

Multipart:

```text
content
image
```

Content has a backend maximum of 500 characters.

Support:

- text
- optional image
- image preview
- character counter
- validation
- upload state

## All posts

Use:

```http
GET /api/v1/posts/all
```

Create a real feed.

## User posts

Use:

```http
GET /api/v1/posts/user/:userId
```

Show posts on creator/channel pages where appropriate.

## Edit post

```http
PATCH /api/v1/posts/:postId
```

Support:

- content editing
- optional image replacement

## Delete post

```http
DELETE /api/v1/posts/:postId
```

Only allow owners to delete/edit their own posts.

Posts must support:

- likes
- comments
- timestamps
- author information
- images

---

# 17. Watch History

Backend:

```http
GET /api/v1/users/history
POST /api/v1/users/history/:videoId
```

Create a History page.

Display:

- video thumbnail
- title
- creator
- duration
- views
- date where available

When a user watches a video, call the history endpoint appropriately.

Do not repeatedly spam the endpoint while the user watches the video.

---

# 18. Application Pages

Create at minimum:

```text
/
├── Home
├── Search Results
├── Watch Video
├── Login
├── Register
├── Channel
├── Upload Video
├── Edit Account
├── Settings
├── Watch History
├── Subscriptions
├── Playlists
├── Playlist Details
├── Community
└── 404
```

Add other pages when required by the backend functionality.

---

# 19. Navigation

Create a professional responsive navigation system.

Desktop:

- logo
- search
- create/upload button
- notifications area if applicable
- user avatar
- profile menu

Sidebar:

- Home
- Subscriptions
- History
- Playlists
- Community
- Your channel
- Settings

Mobile:

- responsive top navigation
- mobile-friendly sidebar/drawer
- bottom navigation where appropriate

Do not add navigation items for functionality that does not exist.

---

# 20. UI/UX Design

The interface should look like a modern professional video platform, but do not simply copy YouTube.

Use a distinctive modern design system.

Requirements:

- clean typography
- consistent spacing
- modern cards
- subtle borders/shadows
- polished hover states
- responsive layout
- dark/light theme support
- accessible contrast
- keyboard-friendly controls
- professional dialogs
- skeleton loaders
- toast notifications
- confirmation dialogs
- proper empty states
- proper error states

Use a consistent design token system.

Avoid:

- excessive gradients
- excessive animations
- oversized text
- unnecessary glassmorphism
- clutter
- placeholder lorem ipsum
- fake statistics

---

# 21. Authentication Architecture

Create an authentication provider/context.

It should expose something similar to:

```js
{
  (user, isAuthenticated, isLoading, login, register, logout, refreshUser);
}
```

Protected routes should automatically redirect unauthenticated users.

Public pages should remain accessible without authentication where the backend allows them.

Handle:

```text
401
403
404
409
500
```

according to backend responses.

---

# 22. API Client

Create one centralized API client.

Example concept:

```js
api.get(...)
api.post(...)
api.patch(...)
api.delete(...)
```

Configure:

```js
withCredentials: true;
```

Centralize:

- base URL
- credentials
- authentication handling
- refresh token behavior
- common error handling

Do not duplicate API configuration in every component.

---

# 23. Backend Response Handling

The backend commonly returns responses shaped like:

```js
{
  (statusCode, data, message, success, errors);
}
```

Build the frontend API layer around the actual response structure.

Do not blindly assume:

```js
response.data;
```

is always the application payload.

Normalize responses where useful.

---

# 24. File Upload Handling

The backend uses Multer and Cloudinary.

Use `FormData` for:

- registration avatar
- registration cover image
- avatar update
- cover image update
- video upload
- thumbnail upload
- post image upload
- post image replacement

Do not manually set an incorrect multipart boundary.

Allow the browser/HTTP library to handle the multipart content type correctly.

---

# 25. Ownership and Authorization

The backend performs ownership checks.

Reflect them in the UI.

Examples:

- only video owners see delete video
- only post owners see edit/delete post
- only comment owners see edit/delete comment
- only playlist owners see edit/delete playlist
- only authenticated users can create comments
- only authenticated users can like
- only authenticated users can subscribe
- only authenticated users can upload

However, frontend authorization is only for UX.

Never treat frontend checks as security.

The backend remains authoritative.

---

# 26. Loading and Error States

Every API-driven page/component must have:

### Loading

Use skeletons or meaningful loading indicators.

### Empty

Examples:

```text
No videos found.
No playlists yet.
You haven't subscribed to any channels.
No comments yet.
No posts yet.
Your watch history is empty.
```

### Error

Show the actual useful backend error message where appropriate.

Do not silently fail.

---

# 27. Optimistic UI

Use optimistic updates only where safe.

Good candidates:

- like toggle
- subscription toggle

If the API request fails:

- rollback the UI state
- show an error

Do not use optimistic behavior for file uploads or destructive operations unless properly handled.

---

# 28. Routing

Use React Router.

Support dynamic routes such as:

```text
/watch/:videoId
/channel/:username
/playlist/:playlistId
```

Do not use full-page reloads for normal navigation.

Create a proper 404 page.

---

# 29. Performance

Implement:

- lazy-loaded pages where useful
- image lazy loading
- pagination
- debounced search input
- request cancellation where useful
- minimal unnecessary re-renders
- memoization only where justified
- reusable API hooks

Do not make an API request on every keystroke.

---

# 30. Responsive Design

The application must work on:

- desktop
- laptop
- tablet
- mobile

Pay particular attention to:

- video player
- video grid
- comments
- upload form
- profile/channel header
- sidebar
- playlist modal
- post feed

---

# 31. Important Backend-Specific Rules

Do not invent API endpoints.

Do not rename backend fields.

Use the exact backend fields.

For example:

```text
fullname
username
email
password
avatar
coverImage
title
description
videoFile
thumbnail
content
oldPassword
newPassword
```

Use the exact route parameter names:

```text
videoId
postId
commentId
playlistId
channelId
userId
username
```

Use the exact query parameters:

```text
page
limit
query
sortBy
sortType
userId
```

---

# 32. Backend Audit Requirement

Before considering the frontend complete, perform a route-by-route audit.

Create an internal checklist matching:

```text
Backend Route
        ↓
API Function
        ↓
React Hook/Service
        ↓
UI Component
        ↓
User Interaction
        ↓
Loading State
        ↓
Error State
        ↓
Success State
```

Every backend route must have a corresponding frontend integration where applicable.

The implementation must not stop after creating the visual pages.

---

# 33. Route Coverage Checklist

The final implementation must cover all of these:

## Users

```text
POST   /users/register
POST   /users/login
POST   /users/logout
POST   /users/refreshToken
POST   /users/change-password
GET    /users/current-user
PATCH  /users/update-account
PATCH  /users/avatar
PATCH  /users/cover-image
GET    /users/c/:username
GET    /users/history
POST   /users/history/:videoId
```

## Videos

```text
POST   /videos
GET    /videos
GET    /videos/:videoId
DELETE /videos/:videoId
```

## Playlists

```text
POST   /playlists
GET    /playlists/user/:userId
GET    /playlists/:playlistId
PATCH  /playlists/:playlistId
DELETE /playlists/:playlistId
POST   /playlists/:playlistId/videos/:videoId
DELETE /playlists/:playlistId/videos/:videoId
```

## Subscriptions

```text
POST   /subscriptions/toggle/:channelId
GET    /subscriptions/subscribed-channels
GET    /subscriptions/subscribers/:channelId
```

## Posts

```text
POST   /posts
GET    /posts/all
GET    /posts/user/:userId
PATCH  /posts/:postId
DELETE /posts/:postId
```

## Comments

```text
POST   /comments/video/:videoId
GET    /comments/video/:videoId
POST   /comments/post/:postId
GET    /comments/post/:postId
PATCH  /comments/:commentId
DELETE /comments/:commentId
```

## Likes

```text
POST   /likes/toggle/video/:videoId
POST   /likes/toggle/comment/:commentId
POST   /likes/toggle/post/:postId

GET    /likes/count/video/:videoId
GET    /likes/count/comment/:commentId
GET    /likes/count/post/:postId

GET    /likes/status/video/:videoId
GET    /likes/status/comment/:commentId
GET    /likes/status/post/:postId
```

---

# 34. Do Not Hide Backend Limitations

If a UI feature normally requires an endpoint that does not exist in the backend, do NOT fake the functionality.

For example:

- do not invent a view-increment endpoint
- do not invent notification APIs
- do not invent video editing APIs
- do not invent user deletion APIs
- do not invent password-reset APIs
- do not invent follow/follower APIs beyond subscriptions

Instead, build the UI around what the backend actually supports.

If a feature is useful but impossible with the current backend, leave it out or clearly mark it as unavailable rather than pretending it works.

---

# 35. Code Quality

Write production-quality code.

Requirements:

- reusable components
- clear naming
- no duplicated API logic
- no giant components
- no unnecessary state
- proper error boundaries where useful
- clean folder structure
- environment-based configuration
- comments only where they add real value
- no dead code
- no unused imports
- no console debugging left in production
- no hardcoded credentials
- no backend secrets in frontend code

---

# 36. Final Verification

Before finishing, verify:

1. Registration works.
2. Login works.
3. Logout works.
4. Session restoration works.
5. Token refresh works.
6. Account editing works.
7. Avatar upload works.
8. Cover image upload works.
9. Video upload works.
10. Thumbnail upload works.
11. Video playback works.
12. Video search works.
13. Pagination works.
14. Sorting works.
15. Video deletion works for the owner.
16. Comments work.
17. Comment editing works.
18. Comment deletion works.
19. Video likes work.
20. Comment likes work.
21. Post likes work.
22. Subscription toggle works.
23. Subscription list works.
24. Subscriber information works.
25. Playlist creation works.
26. Playlist editing works.
27. Playlist deletion works.
28. Adding videos to playlists works.
29. Removing videos from playlists works.
30. Posts can be created.
31. Posts can be edited.
32. Posts can be deleted.
33. Post images work.
34. Post comments work.
35. Watch history works.
36. Channel pages work.
37. Protected routes work.
38. Unauthorized actions are handled.
39. Backend errors are displayed properly.
40. Mobile layout works.
41. No fake/mock API data remains.
42. No backend route listed above is accidentally unused.

---

# 37. Deliverable

Generate the complete frontend application.

Do not only generate the design.

Generate:

- all pages
- all components
- API services
- authentication context
- routing
- hooks
- forms
- upload handling
- error handling
- loading states
- responsive UI
- backend integrations
- environment configuration example
- README with setup instructions

The final application should be capable of running against the supplied backend with minimal configuration.

The goal is:

**Existing backend → fully functional professional frontend**

not:

**Existing backend → visual mockup.**
