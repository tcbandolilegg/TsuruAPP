# Security Specification - Tsuru Health

## Data Invariants
1. A user profile cannot be created without a valid UID matching the authenticated user.
2. The `userType` field can only be 'user' or 'superadmin'.
3. Only superadmins can create other superadmins or modify the `userType` of any user.
4. Users can only read and write their own data.
5. Administrative access is strictly verified against the `admins` collection.
6. The user `tcbandolilegg@gmail.com` is a seed superadmin.

## The Dirty Dozen Payloads

1. **Identity Spoofing**: Attempt to create a user profile with a different `userId`.
2. **Privilege Escalation**: Attempt to set `userType` to 'superadmin' during self-registration.
3. **Invalid Type**: Send `cpf` as a number instead of a string.
4. **Shadow Fields**: Add a field `isVerified: true` that is not in the schema.
5. **Unauthorized Read**: Attempt to read another user's profile.
6. **Orphaned Writes**: Create a user without a valid plan name.
7. **Temporal Violation**: Attempt to set a `createdAt` date in the future (hand-crafted payload).
8. **Resource Poisoning**: Create a user with a 1MB string as the `motherName`.
9. **Admin Spoofing**: Attempt to write to the `admins` collection as a regular user.
10. **State Shortcut**: Change `billingCycle` from 'mensal' to 'anual' without updating `validityDate` correctly (though rules might not catch business logic, they should restrict the fields).
11. **PII Leak**: Attempt to list all users to scrape emails.
12. **Bypassing Verification**: Attempt to write as a user whose email is not verified (if required).

## Test Runner Plan
The `firestore.rules.test.ts` will verify these payloads are rejected.
