-- Proposals System Migration - Ultra Simplified
-- Compatible with existing structure, conflict-free deployment

DO $$
BEGIN
    -- Create proposals table if not exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'proposals') THEN
        CREATE TABLE public.proposals (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
            template_id UUID,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
            amount DECIMAL(12,2),
            currency VARCHAR(10) DEFAULT 'EUR',
            valid_until DATE,
            client_notes TEXT,
            internal_notes TEXT,
            sent_at TIMESTAMP WITH TIME ZONE,
            viewed_at TIMESTAMP WITH TIME ZONE,
            responded_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Create proposal_templates table if not exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'proposal_templates') THEN
        CREATE TABLE public.proposal_templates (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            category VARCHAR(100),
            default_amount DECIMAL(12,2),
            currency VARCHAR(10) DEFAULT 'EUR',
            sections JSONB DEFAULT '[]',
            variables JSONB DEFAULT '{}',
            is_active BOOLEAN DEFAULT true,
            usage_count INTEGER DEFAULT 0,
            conversion_rate DECIMAL(5,2) DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Create proposal_tracking table if not exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'proposal_tracking') THEN
        CREATE TABLE public.proposal_tracking (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE NOT NULL,
            action VARCHAR(50) NOT NULL,
            metadata JSONB DEFAULT '{}',
            ip_address INET,
            user_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Enable RLS if not already enabled
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'proposals' AND policyname = 'Users can view their own proposals') THEN
        ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can view their own proposals" ON public.proposals
            FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert their own proposals" ON public.proposals
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update their own proposals" ON public.proposals
            FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can delete their own proposals" ON public.proposals
            FOR DELETE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'proposal_templates' AND policyname = 'Users can view their own proposal templates') THEN
        ALTER TABLE public.proposal_templates ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can view their own proposal templates" ON public.proposal_templates
            FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert their own proposal templates" ON public.proposal_templates
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update their own proposal templates" ON public.proposal_templates
            FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can delete their own proposal templates" ON public.proposal_templates
            FOR DELETE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'proposal_tracking' AND policyname = 'Users can view tracking of their proposals') THEN
        ALTER TABLE public.proposal_tracking ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can view tracking of their proposals" ON public.proposal_tracking
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.proposals 
                    WHERE proposals.id = proposal_tracking.proposal_id 
                    AND proposals.user_id = auth.uid()
                )
            );
        CREATE POLICY "Users can insert tracking for their proposals" ON public.proposal_tracking
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.proposals 
                    WHERE proposals.id = proposal_tracking.proposal_id 
                    AND proposals.user_id = auth.uid()
                )
            );
    END IF;

    -- Create indices if not exist
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'proposals' AND indexname = 'idx_proposals_user_id') THEN
        CREATE INDEX idx_proposals_user_id ON public.proposals(user_id);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'proposals' AND indexname = 'idx_proposals_status') THEN
        CREATE INDEX idx_proposals_status ON public.proposals(status);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'proposal_templates' AND indexname = 'idx_proposal_templates_user_id') THEN
        CREATE INDEX idx_proposal_templates_user_id ON public.proposal_templates(user_id);
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'proposal_tracking' AND indexname = 'idx_proposal_tracking_proposal_id') THEN
        CREATE INDEX idx_proposal_tracking_proposal_id ON public.proposal_tracking(proposal_id);
    END IF;

END $$;
