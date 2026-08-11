-- Add BLOCKED to the sub-account status enum (owner can disable a client's portal access)
ALTER TYPE "SubAccountStatus" ADD VALUE 'BLOCKED';
