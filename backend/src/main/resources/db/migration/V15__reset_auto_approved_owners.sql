-- When owner approval was introduced (V12), every existing PG_OWNER was bulk-set to APPROVED.
-- Reset all owners except the original demo seed accounts so admin can review them properly.
UPDATE users
SET owner_approval_status = 'PENDING',
    is_verified = FALSE
WHERE role = 'PG_OWNER'
  AND owner_approval_status = 'APPROVED'
  AND email NOT IN ('rajesh@example.com', 'priya@example.com');
