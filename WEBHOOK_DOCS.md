# Milo AI Webhook Integration Guide

## Overview
Milo uses an AI webhook backend to power its intelligent gig matching system. This document explains how to configure your webhook URL and the data schemas involved.

---

## Setting Up Your Webhook URL

### Step 1: Locate the Webhook Configuration
Open the file `src/lib/webhook.ts` and find this line at the top:

```typescript
const BACKEND_WEBHOOK_URL = 'YOUR_N8N_WEBHOOK_URL_HERE';
```

### Step 2: Update with Your Webhook URL
Replace the placeholder with your actual webhook URL (e.g., from n8n, Make.com, or your custom AI backend):

```typescript
const BACKEND_WEBHOOK_URL = 'https://your-webhook-url.com/endpoint';
```

### Note: Mock Mode
If the webhook URL is not configured (still set to `YOUR_N8N_WEBHOOK_URL_HERE`), Milo will automatically fall back to mock mode and generate simulated match results for testing.

---

## Request Schema (What Milo Sends)

When a user submits a gig request through the chatbot, Milo sends a POST request to your webhook with the following JSON payload:

```json
{
  "event_type": "CLIENT_REQUEST_DELEGATION",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "user_profile": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "role": "both",
    "location": "East Hall",
    "max_walk_time_mins": 20,
    "payment_range": {
      "min": 15,
      "max": 40
    },
    "skills_interests": ["Tutoring", "Tech Support", "Photography"]
  },
  "request_details": {
    "raw_message": "I need help moving a couch to the third floor this weekend, willing to pay $30-50/hr",
    "extracted_topic": "Furniture Assembly & Moving",
    "gig_type": "post",
    "category": "Furniture Assembly & Moving",
    "title": "Furniture Assembly & Moving",
    "content": "I need help moving a couch to the third floor this weekend, willing to pay $30-50/hr",
    "pay_min": 30,
    "pay_max": 50,
    "campus_location": "East Hall",
    "is_remote": false,
    "gig_id": "550e8400-e29b-41d4-a716-446655440001"
  }
}
```

### Field Descriptions

#### Top Level
| Field | Type | Description |
|-------|------|-------------|
| `event_type` | string | Always `"CLIENT_REQUEST_DELEGATION"` |
| `timestamp` | string | ISO 8601 timestamp of the request |
| `user_profile` | object | The user's profile information |
| `request_details` | object | The extracted gig details |

#### user_profile Object
| Field | Type | Description |
|-------|------|-------------|
| `user_id` | string | Unique identifier for the user |
| `role` | string | `"poster"`, `"finder"`, or `"both"` |
| `location` | string | User's campus location |
| `max_walk_time_mins` | number | Maximum walking time preference (10, 20, or 40) |
| `payment_range.min` | number | User's minimum pay preference |
| `payment_range.max` | number | User's maximum pay preference |
| `skills_interests` | string[] | User's skills and interests |

#### request_details Object
| Field | Type | Description |
|-------|------|-------------|
| `raw_message` | string | The user's original message to Milo |
| `extracted_topic` | string | AI-extracted topic/category |
| `gig_type` | string | `"post"` (need help) or `"search"` (looking for work) |
| `category` | string | Normalized category name |
| `title` | string | Title for the gig |
| `content` | string | Full description |
| `pay_min` | number | Minimum pay offered/requested |
| `pay_max` | number | Maximum pay offered/requested |
| `campus_location` | string | Where the gig takes place |
| `is_remote` | boolean | Whether the gig can be done remotely |
| `gig_id` | string | Unique ID for this gig |

---

## Response Schema (What Your Webhook Should Return)

Your webhook should respond with a JSON object containing matched users/gigs:

```json
{
  "success": true,
  "matches": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "matched_user_name": "Alex Chen",
      "matched_user_id": "550e8400-e29b-41d4-a716-446655440020",
      "match_score": 95,
      "title": "Furniture Assembly & Moving",
      "category": "Furniture Assembly & Moving",
      "pay_min": 30,
      "pay_max": 50,
      "campus_location": "East Hall",
      "walk_time_mins": 5,
      "description": "Experienced with furniture assembly and moving. Available weekends. Has dolly and tools."
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "matched_user_name": "Jordan Smith",
      "matched_user_id": "550e8400-e29b-41d4-a716-446655440021",
      "match_score": 82,
      "title": "Furniture Assembly & Moving",
      "category": "Furniture Assembly & Moving",
      "pay_min": 25,
      "pay_max": 45,
      "campus_location": "West Hall",
      "walk_time_mins": 12,
      "description": "Strong and reliable. Helped many students with moving tasks."
    }
  ],
  "message": "Found 2 matches"
}
```

### Field Descriptions

#### Top Level
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `success` | boolean | Yes | Whether matching was successful |
| `matches` | array | Yes | Array of match objects (empty if no matches) |
| `message` | string | No | Optional status message |

#### Match Object
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique ID for this match record |
| `matched_user_name` | string | Yes | Name of the matched user |
| `matched_user_id` | string | Yes | ID of the matched user |
| `match_score` | number | Yes | Match percentage (0-100) |
| `title` | string | Yes | Title of the gig |
| `category` | string | Yes | Category of the gig |
| `pay_min` | number | Yes | Minimum pay |
| `pay_max` | number | Yes | Maximum pay |
| `campus_location` | string | Yes | Location of the gig/user |
| `walk_time_mins` | number | Yes | Walking distance in minutes |
| `description` | string | Yes | Brief description of the match |

---

## Match Scoring Recommendations

When calculating `match_score`, consider these factors:

1. **Category Match** (30-40 points): Does the gig category match the user's skills?
2. **Location Proximity** (20-30 points): How close is the match to the user?
3. **Pay Alignment** (15-20 points): Does the pay range overlap with user preferences?
4. **Skills Match** (10-15 points): Do specific skills align?
5. **Availability** (5-10 points): Is the user available at the requested time?

### Example Scoring Algorithm
```javascript
function calculateMatchScore(gig, user) {
  let score = 0;

  // Category match
  if (gig.category === user.skills_interests.includes(gig.category)) {
    score += 35;
  }

  // Location proximity
  if (gig.walk_time_mins <= user.max_walk_time_mins) {
    score += 25;
    score += Math.max(0, 15 - gig.walk_time_mins); // Bonus for closer
  }

  // Pay alignment
  if (gig.pay_min >= user.payment_range.min && gig.pay_max <= user.payment_range.max) {
    score += 20;
  } else if (gig.pay_min >= user.payment_range.min) {
    score += 10;
  }

  // Skills match
  const matchingSkills = user.skills_interests.filter(s =>
    gig.description.toLowerCase().includes(s.toLowerCase())
  );
  score += Math.min(15, matchingSkills.length * 5);

  return Math.min(100, score);
}
```

---

## Categories Reference

Milo uses these standardized categories:

1. `Garage & Vehicle Maintenance`
2. `Furniture Assembly & Moving`
3. `Tutoring & Academic Help`
4. `Tech Support & Repairs`
5. `Laundry & Errands`
6. `Cleaning & Organization`
7. `Photography & Videography`
8. `Graphic Design & Creative Work`
9. `Event Help & Setup`
10. `Food & Grocery Runs`
11. `Pet Care`
12. `Other`

---

## Error Handling

If your webhook encounters an error, return:

```json
{
  "success": false,
  "matches": [],
  "message": "Error description here"
}
```

Milo will display a friendly error message to the user and allow them to retry.

---

## Testing Your Integration

### Using Mock Mode (Default)
The application automatically uses mock mode when `YOUR_N8N_WEBHOOK_URL_HERE` is not changed. This generates realistic test matches without requiring a real backend.

### Testing with a Real Webhook
1. Set up your webhook endpoint (n8n, Make.com, custom server)
2. Update `src/lib/webhook.ts` with your URL
3. Submit a gig through Milo's chat interface
4. Check your webhook logs for the incoming request
5. Verify the response format matches the schema above

---

## Sample n8n Workflow

Here's a basic n8n workflow structure:

```
[Webhook Node] → [Function Node (AI Matching)] → [Respond to Webhook]
```

### Function Node Example (JavaScript)
```javascript
// Get the input payload
const payload = items[0].json;

// Your matching logic here
const matches = performMatching(payload);

// Return response
return [{
  json: {
    success: true,
    matches: matches
  }
}];
```

---

## Security Considerations

1. **HTTPS Only**: Always use HTTPS for your webhook URL
2. **Rate Limiting**: Implement rate limiting on your endpoint
3. **Input Validation**: Validate all incoming data
4. **Authentication**: Consider adding a shared secret header

### Adding Authentication (Optional)
Modify `src/lib/webhook.ts` to include an auth header:

```typescript
const response = await fetch(BACKEND_WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_SECRET_TOKEN',
  },
  body: JSON.stringify(payload),
  signal,
});
```

---

## Support

For issues or questions about the webhook integration, refer to the project README or create an issue in the repository.
