-- Add approval_status and approval fields to organizations table
ALTER TABLE organizations
ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN approved_by_user_id UUID REFERENCES users(id),
ADD COLUMN rejection_reason TEXT;

-- Add is_approved field to users table for organization admins
ALTER TABLE users
ADD COLUMN is_approved BOOLEAN DEFAULT false;

-- Create trigger to handle organization approval
CREATE OR REPLACE FUNCTION handle_organization_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- When organization is approved
  IF NEW.approval_status = 'approved' AND OLD.approval_status != 'approved' THEN
    -- Set approved timestamp
    NEW.approved_at = NOW();
    
    -- Activate organization admin users
    UPDATE users 
    SET is_approved = true,
        is_active = true
    WHERE organization_id = NEW.id 
    AND role = 'admin';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organization_approval_trigger
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION handle_organization_approval();

-- Add indexes for approval status
CREATE INDEX idx_organizations_approval_status ON organizations(approval_status);