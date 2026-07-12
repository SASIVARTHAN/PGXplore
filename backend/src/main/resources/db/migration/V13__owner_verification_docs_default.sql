UPDATE users
SET owner_verification_docs = JSON_ARRAY()
WHERE owner_verification_docs IS NULL;
