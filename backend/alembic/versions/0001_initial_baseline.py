"""0001_initial_baseline

Revision ID: 0001_initial_baseline
Revises: 
Create Date: 2026-09-05 21:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0001_initial_baseline'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. leads
    op.create_table(
        'leads',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('business_name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=50), nullable=False),
        sa.Column('website', sa.String(length=255), nullable=True),
        sa.Column('business_type', sa.String(length=100), nullable=False),
        sa.Column('service_interest', sa.String(length=100), nullable=False),
        sa.Column('problem', sa.Text(), nullable=False),
        sa.Column('budget', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='NEW'),
        sa.Column('source', sa.String(length=100), nullable=False, server_default='Website'),
        sa.Column('utm_source', sa.String(length=100), nullable=True),
        sa.Column('utm_medium', sa.String(length=100), nullable=True),
        sa.Column('utm_campaign', sa.String(length=100), nullable=True),
        sa.Column('utm_content', sa.String(length=100), nullable=True),
        sa.Column('referral_source', sa.String(length=100), nullable=True),
        sa.Column('priority', sa.String(length=50), nullable=False, server_default='MEDIUM'),
        sa.Column('assigned_to', sa.String(length=100), nullable=True),
        sa.Column('estimated_value', sa.Float(), nullable=True),
        sa.Column('next_follow_up_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_contacted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('qualification_notes', sa.Text(), nullable=True),
        sa.Column('decision_maker', sa.String(length=255), nullable=True),
        sa.Column('budget_fit', sa.String(length=100), nullable=True),
        sa.Column('timeline', sa.String(length=100), nullable=True),
        sa.Column('lost_reason', sa.Text(), nullable=True),
        sa.Column('converted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_leads_id'), 'leads', ['id'], unique=False)
    op.create_index(op.f('ix_leads_email'), 'leads', ['email'], unique=False)
    op.create_index(op.f('ix_leads_service_interest'), 'leads', ['service_interest'], unique=False)
    op.create_index(op.f('ix_leads_status'), 'leads', ['status'], unique=False)
    op.create_index(op.f('ix_leads_source'), 'leads', ['source'], unique=False)
    op.create_index(op.f('ix_leads_priority'), 'leads', ['priority'], unique=False)

    # 2. clients
    op.create_table(
        'clients',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('lead_id', sa.Integer(), nullable=False),
        sa.Column('client_code', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('business_name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=50), nullable=False),
        sa.Column('website', sa.String(length=255), nullable=True),
        sa.Column('business_type', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='ACTIVE'),
        sa.Column('source', sa.String(length=100), nullable=False, server_default='Website'),
        sa.Column('assigned_to', sa.String(length=100), nullable=True),
        sa.Column('onboarding_status', sa.String(length=50), nullable=False, server_default='NOT_STARTED'),
        sa.Column('onboarding_completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['lead_id'], ['leads.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('client_code'),
        sa.UniqueConstraint('lead_id')
    )
    op.create_index(op.f('ix_clients_id'), 'clients', ['id'], unique=False)
    op.create_index(op.f('ix_clients_client_code'), 'clients', ['client_code'], unique=True)
    op.create_index(op.f('ix_clients_email'), 'clients', ['email'], unique=False)
    op.create_index(op.f('ix_clients_status'), 'clients', ['status'], unique=False)

    # 3. client_onboarding_items
    op.create_table(
        'client_onboarding_items',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=False),
        sa.Column('item_key', sa.String(length=100), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('completed', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_client_onboarding_items_id'), 'client_onboarding_items', ['id'], unique=False)
    op.create_index(op.f('ix_client_onboarding_items_client_id'), 'client_onboarding_items', ['client_id'], unique=False)

    # 4. lead_activities
    op.create_table(
        'lead_activities',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('lead_id', sa.Integer(), nullable=True),
        sa.Column('client_id', sa.Integer(), nullable=True),
        sa.Column('type', sa.String(length=50), nullable=False, server_default='NOTE'),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('created_by', sa.String(length=100), nullable=True),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['lead_id'], ['leads.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_lead_activities_id'), 'lead_activities', ['id'], unique=False)
    op.create_index(op.f('ix_lead_activities_lead_id'), 'lead_activities', ['lead_id'], unique=False)
    op.create_index(op.f('ix_lead_activities_client_id'), 'lead_activities', ['client_id'], unique=False)

    # 5. proposals
    op.create_table(
        'proposals',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=False),
        sa.Column('lead_id', sa.Integer(), nullable=True),
        sa.Column('proposal_number', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='DRAFT'),
        sa.Column('subtotal', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('discount', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('tax', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('total', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('currency', sa.String(length=10), nullable=False, server_default='USD'),
        sa.Column('valid_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('terms', sa.Text(), nullable=True),
        sa.Column('secure_token', sa.String(length=100), nullable=False),
        sa.Column('accepted_by_name', sa.String(length=255), nullable=True),
        sa.Column('accepted_by_email', sa.String(length=255), nullable=True),
        sa.Column('payment_schedule', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('sent_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('accepted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejected_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['lead_id'], ['leads.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('proposal_number'),
        sa.UniqueConstraint('secure_token')
    )
    op.create_index(op.f('ix_proposals_id'), 'proposals', ['id'], unique=False)
    op.create_index(op.f('ix_proposals_proposal_number'), 'proposals', ['proposal_number'], unique=True)
    op.create_index(op.f('ix_proposals_secure_token'), 'proposals', ['secure_token'], unique=True)

    # 6. proposal_items
    op.create_table(
        'proposal_items',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('proposal_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('quantity', sa.Float(), nullable=False, server_default='1.0'),
        sa.Column('unit_price', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('total', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['proposal_id'], ['proposals.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_proposal_items_id'), 'proposal_items', ['id'], unique=False)
    op.create_index(op.f('ix_proposal_items_proposal_id'), 'proposal_items', ['proposal_id'], unique=False)

    # 7. contracts
    op.create_table(
        'contracts',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=False),
        sa.Column('proposal_id', sa.Integer(), nullable=True),
        sa.Column('contract_number', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='DRAFT'),
        sa.Column('secure_token', sa.String(length=100), nullable=False),
        sa.Column('accepted_by_name', sa.String(length=255), nullable=True),
        sa.Column('accepted_by_email', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('sent_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('accepted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['proposal_id'], ['proposals.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('contract_number'),
        sa.UniqueConstraint('secure_token')
    )
    op.create_index(op.f('ix_contracts_id'), 'contracts', ['id'], unique=False)
    op.create_index(op.f('ix_contracts_contract_number'), 'contracts', ['contract_number'], unique=True)
    op.create_index(op.f('ix_contracts_secure_token'), 'contracts', ['secure_token'], unique=True)

    # 8. invoices
    op.create_table(
        'invoices',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=False),
        sa.Column('proposal_id', sa.Integer(), nullable=True),
        sa.Column('invoice_number', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='DRAFT'),
        sa.Column('subtotal', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('discount', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('tax', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('total', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('amount_paid', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('amount_due', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('currency', sa.String(length=10), nullable=False, server_default='USD'),
        sa.Column('issue_date', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('secure_token', sa.String(length=100), nullable=False),
        sa.Column('paid_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['proposal_id'], ['proposals.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('invoice_number'),
        sa.UniqueConstraint('secure_token')
    )
    op.create_index(op.f('ix_invoices_id'), 'invoices', ['id'], unique=False)
    op.create_index(op.f('ix_invoices_invoice_number'), 'invoices', ['invoice_number'], unique=True)
    op.create_index(op.f('ix_invoices_secure_token'), 'invoices', ['secure_token'], unique=True)

    # 9. invoice_items
    op.create_table(
        'invoice_items',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('invoice_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('quantity', sa.Float(), nullable=False, server_default='1.0'),
        sa.Column('unit_price', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('total', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['invoice_id'], ['invoices.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_invoice_items_id'), 'invoice_items', ['id'], unique=False)
    op.create_index(op.f('ix_invoice_items_invoice_id'), 'invoice_items', ['invoice_id'], unique=False)

    # 10. invoice_installments
    op.create_table(
        'invoice_installments',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('invoice_id', sa.Integer(), nullable=False),
        sa.Column('installment_number', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('description', sa.String(length=255), nullable=False),
        sa.Column('percentage', sa.Float(), nullable=True),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='PENDING'),
        sa.Column('payment_id', sa.Integer(), nullable=True),
        sa.Column('paid_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['invoice_id'], ['invoices.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_invoice_installments_id'), 'invoice_installments', ['id'], unique=False)
    op.create_index(op.f('ix_invoice_installments_invoice_id'), 'invoice_installments', ['invoice_id'], unique=False)

    # 11. payments
    op.create_table(
        'payments',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('invoice_id', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('payment_method', sa.String(length=50), nullable=False, server_default='BANK_TRANSFER'),
        sa.Column('reference', sa.String(length=100), nullable=True),
        sa.Column('paid_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['invoice_id'], ['invoices.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_payments_id'), 'payments', ['id'], unique=False)
    op.create_index(op.f('ix_payments_invoice_id'), 'payments', ['invoice_id'], unique=False)

    # 12. payment_confirmations
    op.create_table(
        'payment_confirmations',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('invoice_id', sa.Integer(), nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('payment_method', sa.String(length=50), nullable=False, server_default='BANK_TRANSFER'),
        sa.Column('reference', sa.String(length=100), nullable=False),
        sa.Column('payer_name', sa.String(length=255), nullable=False),
        sa.Column('payer_email', sa.String(length=255), nullable=False),
        sa.Column('payment_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='PENDING_VERIFICATION'),
        sa.Column('reviewed_by', sa.String(length=100), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['invoice_id'], ['invoices.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_payment_confirmations_id'), 'payment_confirmations', ['id'], unique=False)
    op.create_index(op.f('ix_payment_confirmations_invoice_id'), 'payment_confirmations', ['invoice_id'], unique=False)
    op.create_index(op.f('ix_payment_confirmations_client_id'), 'payment_confirmations', ['client_id'], unique=False)

    # 13. projects
    op.create_table(
        'projects',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=False),
        sa.Column('proposal_id', sa.Integer(), nullable=True),
        sa.Column('contract_id', sa.Integer(), nullable=True),
        sa.Column('invoice_id', sa.Integer(), nullable=True),
        sa.Column('project_code', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('service_type', sa.String(length=50), nullable=False, server_default='CUSTOM'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='PLANNED'),
        sa.Column('priority', sa.String(length=50), nullable=False, server_default='MEDIUM'),
        sa.Column('health', sa.String(length=50), nullable=False, server_default='ON_TRACK'),
        sa.Column('assigned_to', sa.String(length=100), nullable=True),
        sa.Column('waiting_for', sa.Text(), nullable=True),
        sa.Column('public_token', sa.String(length=100), nullable=False),
        sa.Column('start_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('target_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('handover_checklist', sa.JSON(), nullable=True),
        sa.Column('handover_notes', sa.Text(), nullable=True),
        sa.Column('handover_completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['contract_id'], ['contracts.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['invoice_id'], ['invoices.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['proposal_id'], ['proposals.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('project_code'),
        sa.UniqueConstraint('public_token')
    )
    op.create_index(op.f('ix_projects_id'), 'projects', ['id'], unique=False)
    op.create_index(op.f('ix_projects_project_code'), 'projects', ['project_code'], unique=True)
    op.create_index(op.f('ix_projects_public_token'), 'projects', ['public_token'], unique=True)

    # 14. project_briefs
    op.create_table(
        'project_briefs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('business_name', sa.String(length=255), nullable=True),
        sa.Column('industry', sa.String(length=100), nullable=True),
        sa.Column('target_audience', sa.Text(), nullable=True),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('website_domain', sa.String(length=255), nullable=True),
        sa.Column('existing_website', sa.String(length=255), nullable=True),
        sa.Column('brand_description', sa.Text(), nullable=True),
        sa.Column('logo_received', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('colors', sa.String(length=255), nullable=True),
        sa.Column('fonts', sa.String(length=255), nullable=True),
        sa.Column('visual_references', sa.Text(), nullable=True),
        sa.Column('brand_guidelines_url', sa.String(length=1000), nullable=True),
        sa.Column('primary_business_goal', sa.Text(), nullable=True),
        sa.Column('website_goal', sa.Text(), nullable=True),
        sa.Column('conversion_goal', sa.Text(), nullable=True),
        sa.Column('primary_cta', sa.String(length=255), nullable=True),
        sa.Column('content_status', sa.String(length=100), nullable=True),
        sa.Column('copy_received', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('images_received', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('videos_received', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('testimonials_received', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('other_assets', sa.Text(), nullable=True),
        sa.Column('domain_info', sa.String(length=255), nullable=True),
        sa.Column('hosting_info', sa.String(length=255), nullable=True),
        sa.Column('cms_requirement', sa.String(length=100), nullable=True),
        sa.Column('integrations_needed', sa.Text(), nullable=True),
        sa.Column('analytics_needed', sa.Text(), nullable=True),
        sa.Column('forms_needed', sa.Text(), nullable=True),
        sa.Column('payment_requirements', sa.Text(), nullable=True),
        sa.Column('third_party_services', sa.Text(), nullable=True),
        sa.Column('required_pages', sa.Text(), nullable=True),
        sa.Column('required_features', sa.Text(), nullable=True),
        sa.Column('user_accounts_needed', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('admin_requirements', sa.Text(), nullable=True),
        sa.Column('discovery_checklist', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('project_id')
    )
    op.create_index(op.f('ix_project_briefs_id'), 'project_briefs', ['id'], unique=False)

    # 15. project_milestones
    op.create_table(
        'project_milestones',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='UPCOMING'),
        sa.Column('target_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_project_milestones_id'), 'project_milestones', ['id'], unique=False)
    op.create_index(op.f('ix_project_milestones_project_id'), 'project_milestones', ['project_id'], unique=False)

    # 16. project_approvals
    op.create_table(
        'project_approvals',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('item_type', sa.String(length=50), nullable=False, server_default='DESIGN'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('preview_url', sa.String(length=1000), nullable=True),
        sa.Column('asset_urls', sa.JSON(), nullable=True),
        sa.Column('public_token', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='PENDING'),
        sa.Column('decision_name', sa.String(length=255), nullable=True),
        sa.Column('decision_email', sa.String(length=255), nullable=True),
        sa.Column('decision_comment', sa.Text(), nullable=True),
        sa.Column('decision_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_by', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('public_token')
    )
    op.create_index(op.f('ix_project_approvals_id'), 'project_approvals', ['id'], unique=False)
    op.create_index(op.f('ix_project_approvals_project_id'), 'project_approvals', ['project_id'], unique=False)
    op.create_index(op.f('ix_project_approvals_public_token'), 'project_approvals', ['public_token'], unique=True)

    # 17. project_updates
    op.create_table(
        'project_updates',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False, server_default='PROGRESS'),
        sa.Column('customer_visible', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_by', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_project_updates_id'), 'project_updates', ['id'], unique=False)
    op.create_index(op.f('ix_project_updates_project_id'), 'project_updates', ['project_id'], unique=False)

    # 18. project_tasks
    op.create_table(
        'project_tasks',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='TODO'),
        sa.Column('priority', sa.String(length=50), nullable=False, server_default='MEDIUM'),
        sa.Column('assigned_to', sa.String(length=100), nullable=True),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_project_tasks_id'), 'project_tasks', ['id'], unique=False)
    op.create_index(op.f('ix_project_tasks_project_id'), 'project_tasks', ['project_id'], unique=False)

    # 19. project_activities
    op.create_table(
        'project_activities',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False, server_default='NOTE'),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('created_by', sa.String(length=100), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_project_activities_id'), 'project_activities', ['id'], unique=False)
    op.create_index(op.f('ix_project_activities_project_id'), 'project_activities', ['project_id'], unique=False)

    # 20. project_resources
    op.create_table(
        'project_resources',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('url', sa.String(length=1000), nullable=False),
        sa.Column('resource_type', sa.String(length=50), nullable=False, server_default='DOCUMENT'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_project_resources_id'), 'project_resources', ['id'], unique=False)
    op.create_index(op.f('ix_project_resources_project_id'), 'project_resources', ['project_id'], unique=False)

    # 21. notifications
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('type', sa.String(length=100), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('entity_type', sa.String(length=50), nullable=True),
        sa.Column('entity_id', sa.Integer(), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('action_url', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notifications_id'), 'notifications', ['id'], unique=False)
    op.create_index(op.f('ix_notifications_is_read'), 'notifications', ['is_read'], unique=False)

    # 22. email_logs
    op.create_table(
        'email_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('event_type', sa.String(length=100), nullable=False),
        sa.Column('recipient', sa.String(length=255), nullable=False),
        sa.Column('subject', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='SENT'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('sent_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_email_logs_id'), 'email_logs', ['id'], unique=False)
    op.create_index(op.f('ix_email_logs_status'), 'email_logs', ['status'], unique=False)


def downgrade() -> None:
    op.drop_table('email_logs')
    op.drop_table('notifications')
    op.drop_table('project_resources')
    op.drop_table('project_activities')
    op.drop_table('project_tasks')
    op.drop_table('project_updates')
    op.drop_table('project_approvals')
    op.drop_table('project_milestones')
    op.drop_table('project_briefs')
    op.drop_table('projects')
    op.drop_table('payment_confirmations')
    op.drop_table('payments')
    op.drop_table('invoice_installments')
    op.drop_table('invoice_items')
    op.drop_table('invoices')
    op.drop_table('contracts')
    op.drop_table('proposal_items')
    op.drop_table('proposals')
    op.drop_table('lead_activities')
    op.drop_table('client_onboarding_items')
    op.drop_table('clients')
    op.drop_table('leads')
