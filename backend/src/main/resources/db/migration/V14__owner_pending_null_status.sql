UPDATE users
SET owner_approval_status = 'PENDING'
WHERE role = 'PG_OWNER'
  AND owner_approval_status IS NULL;
