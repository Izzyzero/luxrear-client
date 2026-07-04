# 8. Data Flow Examples

## Example 1: User Creates a Post

```
1. User fills form -> React component state
2. Component calls postService.createPost(data)
3. postService -> axios.post('/posts', data)
4. Axios adds Authorization: Bearer <token> header
5. Express receives request
6. Middleware: protect()
   |-- Extracts Bearer token from Authorization header
   |-- jwt.verify(token) -> decoded { id, iat, exp }
   |-- User.findById(decoded.id) -> req.user
   +-- Check req.user.is_banned === false
7. Middleware: validate() checks express-validator rules
8. Controller: postController.createPost()
   |-- Extracts { type, title, description, category_id, tags, location }
   |-- Finds Profile by req.user._id
   |-- post = await Post.create({ profile_id: profile._id, ...rest })
   +-- Returns successResponse(res, 201, 'Post created', post)
9. Response flows back to client
10. Component updates UI with new post (optimistic or after response)
```

## Example 2: User Comments on a Post (with Notification)

```
1. Component calls commentService.createComment({ post_id, content })
2. Controller: commentController.createComment()
   |-- Creates comment document in MongoDB
   |-- Increments Post.comment_count by 1
   |-- Finds the post to get post owner's profile
   |-- If commenter !== post owner:
   |     createNotification({
   |       user_id: post owner,
   |       type: 'post_comment',
   |       message: '<commenter name> commented on your post',
   |       reference_id: post._id,
   |       reference_type: 'Post'
   |     })
   +-- Returns comment with 201
3. Client receives response -> UI updates
```

## Example 3: User Toggles a Reaction

```
1. Component calls reactionService.toggleReaction({ type: 'like', post_id })
2. Controller: reactionController.toggleReaction()
   |-- Find existing reaction: Reaction.findOne({ profile_id, post_id })
   |-- If exists AND same type -> delete (unreact)
   |-- If exists AND different type -> update type (change reaction)
   |-- If not exists -> Reaction.create (new reaction)
   |-- Recalculate Post.reaction_count
   |-- If new reaction AND not self:
   |     createNotification({ type: 'post_reaction', ... })
   +-- Returns updated reaction or null
3. Client toggles UI state accordingly
```

## Example 4: Admin Moderation Flow

```
1. Admin clicks "Flag Post" in admin panel
2. Frontend -> PATCH /api/admin/posts/:id/flag
3. Middleware: protect() -> req.user (checks user exists, not banned)
4. Middleware: restrictTo('admin') -> checks req.user.role === 'admin'
5. Controller: adminController.flagPost()
   |-- post = await Post.findById(id)
   |-- post.is_flagged = !post.is_flagged (toggle)
   |-- post.save()
   +-- Returns updated post with new flagged state
6. Post now shows/hides flagged status in admin panel
7. Optional: regular users can create Reports via Report model
   (separate flow, not through admin endpoint)
```

## Example 5: Paginated Feed Load

```
1. Component mounts -> calls postService.getPosts({ page: 1, limit: 20, type: 'OPPORTUNITY' })
2. Controller: postController.getPosts()
   |-- Builds filter object from query params:
   |     { type: 'OPPORTUNITY', is_flagged: false }
   |-- If search param: adds { title: { $regex: search, $options: 'i' } }
   |-- If tags param: adds { tags: { $in: tags.split(',') } }
   |-- Builds sort: { is_featured: -1, created_at: -1 }
   |-- Executes count query: Post.countDocuments(filter)
   |-- Executes data query: Post.find(filter)
   |     .sort(sort)
   |     .skip((page - 1) * limit)
   |     .limit(limit)
   |     .populate('profile_id', 'full_name image_url')
   |-- Calculates pagination: { page, limit, total, pages }
   +-- Returns paginatedResponse(res, msg, data, pagination)
3. Component renders list + pagination controls
```

## Example 6: Email Verification

```
1. User registers -> authController.createUser()
   |-- Creates user, generates email_verification_token (crypto)
   |-- Stores token + expiry on User document
   |-- Sends email via nodemailer with verification link:
   |     https://api.luxrear.com/api/auth/verify-email?token=xxx
   +-- Returns 201 (user can still log in, unverified)
2. User clicks link -> GET /auth/verify-email?token=xxx
   |-- Finds user by token + checks expiry
   |-- Sets is_verified = true
   |-- Clears token fields
   +-- Returns success message
```

## Data Flow by Section

| Use Case | Frontend | API Call | Backend Action |
|----------|----------|----------|----------------|
| View feed | Feed page | GET /posts?type=OPPORTUNITY | Filter + sort + paginate |
| Create exchange post | Exchange page | POST /posts { type: 'INVESTMENT' } | Create + return post |
| View comments | Post detail | GET /comments?post_id=xxx | Find + populate + sort |
| Reply to comment | Post detail | POST /comments { parent_id } | Create + nest |
| Send connection | Profile page | POST /connections | Create + notify |
| View notifications | Notification page | GET /notifications | Find by user_id |
| Moderate content | Admin panel | PATCH /admin/posts/:id/flag | Toggle flag + return |
| Dashboard stats | Admin panel | GET /admin/stats | Aggregated counts |
