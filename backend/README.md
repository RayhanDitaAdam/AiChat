

## Backend Feature Verification Results (2026-01-27T12:31:07.681Z)

| Feature | Status | Details |
|---------|--------|---------|
| Owner Setup | FAIL | 
Invalid `prisma.user.create()` invocation in
/home/han/Coding/AiChat/backend/src/scripts/test_features.ts:38:39

  35 console.log('Creating Test Owner in DB...');
  36 const hashedPassword = await PasswordUtil.hash(userPassword);
  37 
→ 38 ownerUser = await prisma.user.create(
Foreign key constraint violated: `User_ownerId_fkey (index)` |
| User Flow | FAIL | Success |
| Create Rating | FAIL | Skipped |

**Details JSON:**
```json
[
  {
    "name": "Owner Setup",
    "status": "FAIL",
    "error": "\nInvalid `prisma.user.create()` invocation in\n/home/han/Coding/AiChat/backend/src/scripts/test_features.ts:38:39\n\n  35 console.log('Creating Test Owner in DB...');\n  36 const hashedPassword = await PasswordUtil.hash(userPassword);\n  37 \n→ 38 ownerUser = await prisma.user.create(\nForeign key constraint violated: `User_ownerId_fkey (index)`"
  },
  {
    "name": "User Flow",
    "status": "FAIL",
    "error": ""
  },
  {
    "name": "Create Rating",
    "status": "FAIL",
    "details": "Skipped due to missing user/owner",
    "error": "Skipped"
  }
]
```


## Backend Feature Verification Results (2026-01-27T12:32:45.674Z)

| Feature | Status | Details |
|---------|--------|---------|
| Create Owner (DB) | PASS | Success |
| Owner Setup | FAIL | Success |
| User Flow | FAIL | Success |
| Create Rating | FAIL | Skipped |

**Details JSON:**
```json
[
  {
    "name": "Create Owner (DB)",
    "status": "PASS",
    "details": {
      "ownerId": "d04532ba-4614-42be-a8a6-f0b37dba78bb",
      "email": "owner_1769517165454@test.com"
    }
  },
  {
    "name": "Owner Setup",
    "status": "FAIL",
    "error": ""
  },
  {
    "name": "User Flow",
    "status": "FAIL",
    "details": "",
    "error": ""
  },
  {
    "name": "Create Rating",
    "status": "FAIL",
    "details": "Skipped due to missing user/owner",
    "error": "Skipped"
  }
]
```


## Backend Feature Verification Results (2026-01-27T12:34:07.395Z)

| Feature | Status | Details |
|---------|--------|---------|
| Create Owner (DB) | PASS | Success |
| Owner Setup | FAIL | Success |
| User Flow | FAIL | Success |
| Create Rating | FAIL | Skipped |

**Details JSON:**
```json
[
  {
    "name": "Create Owner (DB)",
    "status": "PASS",
    "details": {
      "ownerId": "a01fd2a3-95a6-4e4e-a043-1ca6319ec721",
      "email": "owner_1769517247098@test.com"
    }
  },
  {
    "name": "Owner Setup",
    "status": "FAIL",
    "error": ""
  },
  {
    "name": "User Flow",
    "status": "FAIL",
    "details": "",
    "error": ""
  },
  {
    "name": "Create Rating",
    "status": "FAIL",
    "details": "Skipped due to missing user/owner",
    "error": "Skipped"
  }
]
```


## Backend Feature Verification Results (2026-01-27T12:35:17.260Z)

| Feature | Status | Details |
|---------|--------|---------|
| Create Owner (DB) | PASS | Success |
| Owner Login | PASS | Success |
| User Flow | FAIL | Request failed with status code 400 |
| Create Rating | FAIL | Skipped |
| Owner Get Ratings | PASS | Success |

**Details JSON:**
```json
[
  {
    "name": "Create Owner (DB)",
    "status": "PASS",
    "details": {
      "ownerId": "b8f2b2c5-e5a6-4f33-bfab-1d52b5d9ff30",
      "email": "owner_1769517316824@test.com"
    }
  },
  {
    "name": "Owner Login",
    "status": "PASS",
    "details": {
      "token": "***"
    }
  },
  {
    "name": "User Flow",
    "status": "FAIL",
    "details": {
      "status": "error",
      "message": "Password must contain at least one uppercase letter"
    },
    "error": "Request failed with status code 400"
  },
  {
    "name": "Create Rating",
    "status": "FAIL",
    "details": "Skipped due to missing user/owner",
    "error": "Skipped"
  },
  {
    "name": "Owner Get Ratings",
    "status": "PASS",
    "details": {
      "count": 0
    }
  }
]
```


## Backend Feature Verification Results (2026-01-27T12:36:05.199Z)

| Feature | Status | Details |
|---------|--------|---------|
| Create Owner (DB) | PASS | Success |
| Owner Login | PASS | Success |
| User Registration | PASS | Success |
| User Login | PASS | Success |
| Create Rating | FAIL | Request failed with status code 400 |
| Owner Get Ratings | PASS | Success |

**Details JSON:**
```json
[
  {
    "name": "Create Owner (DB)",
    "status": "PASS",
    "details": {
      "ownerId": "b2b795e8-8949-4bcf-9406-3ac7d714c30e",
      "email": "owner_1769517364454@test.com"
    }
  },
  {
    "name": "Owner Login",
    "status": "PASS",
    "details": {
      "token": "***"
    }
  },
  {
    "name": "User Registration",
    "status": "PASS",
    "details": {
      "userId": "0f817fd2-8b41-4e67-ab3c-e5701a6207de",
      "email": "user_1769517364454@test.com"
    }
  },
  {
    "name": "User Login",
    "status": "PASS",
    "details": {
      "token": "***"
    }
  },
  {
    "name": "Create Rating",
    "status": "FAIL",
    "details": {
      "status": "error",
      "message": "Validation failed",
      "errors": [
        {
          "path": "body.ownerId",
          "message": "Invalid input: expected string, received undefined"
        }
      ]
    },
    "error": "Request failed with status code 400"
  },
  {
    "name": "Owner Get Ratings",
    "status": "PASS",
    "details": {
      "count": 0
    }
  }
]
```


## Backend Feature Verification Results (2026-01-27T13:40:05.486Z)

| Feature | Status | Details |
|---------|--------|---------|
| Create Owner (DB) | PASS | Success |
| Owner Login | PASS | Success |
| User Registration | PASS | Success |
| User Login | PASS | Success |
| Create Rating | FAIL | Request failed with status code 400 |
| Owner Get Ratings | PASS | Success |

**Details JSON:**
```json
[
  {
    "name": "Create Owner (DB)",
    "status": "PASS",
    "details": {
      "ownerId": "ef6b4f9d-9121-4151-8a39-6ab900a60860",
      "email": "owner_1769521204716@test.com"
    }
  },
  {
    "name": "Owner Login",
    "status": "PASS",
    "details": {
      "token": "***"
    }
  },
  {
    "name": "User Registration",
    "status": "PASS",
    "details": {
      "userId": "2251c405-57e2-4993-9efb-be6557863704",
      "email": "user_1769521204716@test.com"
    }
  },
  {
    "name": "User Login",
    "status": "PASS",
    "details": {
      "token": "***"
    }
  },
  {
    "name": "Create Rating",
    "status": "FAIL",
    "details": {
      "status": "error",
      "message": "Cannot read properties of undefined (reading 'ownerId')"
    },
    "error": "Request failed with status code 400"
  },
  {
    "name": "Owner Get Ratings",
    "status": "PASS",
    "details": {
      "count": 0
    }
  }
]
```
