# 4. Database Schema (ERD)

## Collection Relationships

```
+------------------+          +------------------+
|      User        |          |     Profile       |
+------------------+          +------------------+
| _id (ObjectId)   |<-------->| _id              |
| email (unique)   |    1:1   | user_id (ref)    |
| phone (unique)   |          | full_name         |
| password (bcrypt)|          | business_name     |
| role (enum)      |          | industry          |
| country          |          | location          |
| is_verified      |          | services[]        |
| is_banned        |          | image_url         |
| refresh_token    |          | origin_country    |
+--------+---------+          | current_country   |
         |                    | show_in_diaspora  |
         |                    +--------+----------+
         |                             |
         |  +--------------------------+
         |  |
         |  v
         |  +------------------+      +------------------+
         |  |      Post        |      |     Comment       |
         |  +------------------+      +------------------+
         |  | _id              |      | _id              |
         |  | profile_id (ref) +------>| post_id (ref)    |
         |  | type (enum)      |      | profile_id (ref) |
         |  | title            |      | content          |
         |  | description      |      | parent_id (ref)  |
         |  | category_id(ref) |      +------------------+
         |  | tags[]           |
         |  | is_flagged       |      +------------------+
         |  | is_featured      |      |    Reaction       |
         |  | comment_count    |      +------------------+
         |  | reaction_count   |      | _id              |
         +------------------+      | profile_id (ref) |
                                    | post_id (ref)    |
                                    | comment_id (ref) |
                                    | type (enum)      |
                                    +------------------+

+------------------+      +------------------+
|   Connection      |      |  Notification     |
+------------------+      +------------------+
| _id              |      | _id              |
| requester_id(ref)|      | user_id (ref)    |
| receiver_id(ref) |      | type (enum)      |
| status (enum)    |      | message          |
+------------------+      | reference_id     |
                           | reference_type   |
+------------------+      | is_read          |
|    Category       |      +------------------+
+------------------+
| _id              |      +------------------+
| name             |      |     Report        |
| type (enum)      |      +------------------+
+------------------+      | _id              |
                           | reporter_id(ref) |
                           | post_id (ref)    |
                           | comment_id (ref) |
                           | reason (enum)    |
                           | description      |
                           | is_resolved      |
                           +------------------+
```

## 9 Collections Summary

| Collection | Key Fields | References | Key Indexes |
|-----------|-----------|------------|-------------|
| **users** | email, phone, password (bcrypt), role, is_verified, is_banned, onboarding_complete | -- | email (unique sparse), phone (unique sparse) |
| **profiles** | full_name, business_name, industry, location, services[], image_url, diaspora fields | user_id | user_id (unique) |
| **posts** | type (14 enum values), title, description, tags[], is_flagged, is_featured, comment_count, reaction_count | profile_id, category_id | type+created_at, profile_id, tags |
| **comments** | content, parent_id (nullable = 1-level nesting) | post_id, profile_id | post_id+created_at |
| **reactions** | type (like/love/insightful/support), post_id XOR comment_id | profile_id, post_id, comment_id | profile_id+post_id (unique compound) |
| **connections** | status (pending/accepted/rejected/blocked) | requester_id, receiver_id | requester+receiver (unique compound) |
| **notifications** | type (9 values), message, reference_id, reference_type, is_read | user_id | user_id+created_at |
| **reports** | reason (spam/harassment/ misinformation/inappropriate/scam/other), description, is_resolved | reporter_id, post_id, comment_id | is_resolved |
| **categories** | name, type (community/learning/exchange) | -- | type |

## Key Schema Design Decisions

### 1. Single Posts Collection (Polymorphic)

One `posts` collection covers all 6 sections using the `type` enum (14 values). No separate collections for Exchange, Learning, Diaspora, etc.

**Why:** Simpler queries, one set of indexes, consistent CRUD. Each section is just a filter: `GET /posts?type=INVESTMENT`.

### 2. 1:1 User / Profile Split

User holds auth + identity fields. Profile holds business/member details.

**Why:** Separation of concerns. Auth middleware loads User (lightweight). Profile queries are separate. Profile picture upload doesn't touch the User document.

### 3. Denormalized Counters

`comment_count` and `reaction_count` live on the Post document.

**Why:** Avoids expensive `$count` aggregations on every feed load. Updated atomically on comment/reaction create/delete.

### 4. 1-Level Comment Nesting

Comments can have a `parent_id`, but replies cannot have their own replies.

**Why:** Keeps query logic simple (find by post_id, sort by parent_id). Avoids recursion. Good UX for discussion without infinite threading complexity.

### 5. Reactions Target Post OR Comment (XOR)

Reaction schema has both `post_id` and `comment_id`, but a validator ensures exactly one is set.

**Why:** Single reactions collection, one toggle endpoint, one set of indexes.
