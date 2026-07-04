# 7. Notification Flow

## Trigger Points

Notifications are created inline in controllers (not via Mongoose hooks) for explicit control and error handling.

### Comment Triggers

```
+----------------------+     +--------------------------+
|  User A comments on  |     |  Controller creates       |
|  User B's post       |---->|  Notification for User B  |
|                      |     |  type: "post_comment"     |
+----------------------+     |  message: "A commented   |
                              |    on your post"          |
+----------------------+     +--------------------------+
|  User A replies to   |     +--------------------------+
|  User B's comment    |---->|  Notification for User B  |
|                      |     |  type: "comment_reply"    |
+----------------------+     +--------------------------+
```

### Reaction Triggers

```
+----------------------+     +--------------------------+
|  User A reacts to    |     |  Notification for User B  |
|  User B's post       |---->|  type: "post_reaction"   |
|                      |     |  (skipped if A === B)     |
+----------------------+     +--------------------------+
```

### Connection Triggers

```
+----------------------+     +--------------------------+
|  User A sends        |     |  Notification for User B  |
|  connection request  |---->|  type: "connection_      |
|  to User B           |     |  request"                |
+----------------------+     +--------------------------+

+----------------------+     +--------------------------+
|  User B accepts      |     |  Notification for User A  |
|  connection request  |---->|  type: "connection_      |
|                      |     |  accepted"               |
+----------------------+     +--------------------------+
```

## notificationService.js

```javascript
// Reusable utility -- used by all controllers
createNotification({ user_id, type, message, reference_id, reference_type })

// Returns created Notification document
// On failure: logs error, returns null (never blocks main operation)
```

## Notification Types (9)

| Type | Triggered By | Target |
|------|-------------|--------|
| new_opportunity | (future: admin broadcast) | All/specific users |
| post_comment | Comment on user's post | Post owner via profile_id lookup |
| comment_reply | Reply to user's comment | Original commenter |
| post_reaction | Reaction on user's post | Post owner (excludes self-reaction) |
| connection_request | Connection sent | Request receiver |
| connection_accepted | Connection accepted | Original requester |
| member_verified | Admin verifies user | Verified user |
| post_featured | Admin features post | Post owner |
| system | (future: system messages) | Target user |

## Notification Response Format

```json
{
  "success": true,
  "message": "Notifications fetched.",
  "data": [
    {
      "_id": "60f7...",
      "user_id": "60f7...",
      "type": "post_comment",
      "message": "John commented on your post",
      "reference_id": "60f7...",
      "reference_type": "Post",
      "is_read": false,
      "created_at": "2026-07-04T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

## Unread Count (via header)

Each notification GET response includes `X-Unread-Count` header with the total unread count for badge display on the frontend.
