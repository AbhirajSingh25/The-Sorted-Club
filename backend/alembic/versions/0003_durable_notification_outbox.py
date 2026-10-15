"""0003_durable_notification_outbox

Revision ID: 0003_durable_notification_outbox
Revises: 0002_admin_security_and_push_subscriptions
Create Date: 2026-10-15 10:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0003_durable_notification_outbox'
down_revision: Union[str, None] = '0002_admin_security_and_push_subscriptions'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create notification_jobs table
    op.create_table(
        'notification_jobs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('idempotency_key', sa.String(length=255), nullable=False),
        sa.Column('channel', sa.String(length=50), server_default='EMAIL', nullable=False),
        sa.Column('event_type', sa.String(length=100), nullable=False),
        sa.Column('lead_id', sa.Integer(), nullable=True),
        sa.Column('recipient', sa.String(length=255), nullable=True),
        sa.Column('subject', sa.String(length=255), nullable=True),
        sa.Column('payload', sa.JSON(), nullable=False),
        sa.Column('status', sa.String(length=50), server_default='PENDING', nullable=False),
        sa.Column('attempts', sa.Integer(), server_default='0', nullable=False),
        sa.Column('max_attempts', sa.Integer(), server_default='5', nullable=False),
        sa.Column('next_retry_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_attempt_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_error', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['lead_id'], ['leads.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notification_jobs_id'), 'notification_jobs', ['id'], unique=False)
    op.create_index(op.f('ix_notification_jobs_idempotency_key'), 'notification_jobs', ['idempotency_key'], unique=True)
    op.create_index(op.f('ix_notification_jobs_channel'), 'notification_jobs', ['channel'], unique=False)
    op.create_index(op.f('ix_notification_jobs_event_type'), 'notification_jobs', ['event_type'], unique=False)
    op.create_index(op.f('ix_notification_jobs_lead_id'), 'notification_jobs', ['lead_id'], unique=False)
    op.create_index(op.f('ix_notification_jobs_status'), 'notification_jobs', ['status'], unique=False)
    op.create_index(op.f('ix_notification_jobs_next_retry_at'), 'notification_jobs', ['next_retry_at'], unique=False)

    # 2. Add lead_id, attempts, last_attempt_at, next_retry_at to email_logs for observability
    with op.batch_alter_table('email_logs') as batch_op:
        batch_op.add_column(sa.Column('lead_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('attempts', sa.Integer(), server_default='1', nullable=True))
        batch_op.add_column(sa.Column('last_attempt_at', sa.DateTime(timezone=True), nullable=True))
        batch_op.add_column(sa.Column('next_retry_at', sa.DateTime(timezone=True), nullable=True))
        batch_op.create_foreign_key('fk_email_logs_lead_id', 'leads', ['lead_id'], ['id'], ondelete='SET NULL')
        batch_op.create_index(op.f('ix_email_logs_lead_id'), ['lead_id'], unique=False)


def downgrade() -> None:
    with op.batch_alter_table('email_logs') as batch_op:
        batch_op.drop_index(op.f('ix_email_logs_lead_id'))
        batch_op.drop_constraint('fk_email_logs_lead_id', type_='foreignkey')
        batch_op.drop_column('next_retry_at')
        batch_op.drop_column('last_attempt_at')
        batch_op.drop_column('attempts')
        batch_op.drop_column('lead_id')

    op.drop_index(op.f('ix_notification_jobs_next_retry_at'), table_name='notification_jobs')
    op.drop_index(op.f('ix_notification_jobs_status'), table_name='notification_jobs')
    op.drop_index(op.f('ix_notification_jobs_lead_id'), table_name='notification_jobs')
    op.drop_index(op.f('ix_notification_jobs_event_type'), table_name='notification_jobs')
    op.drop_index(op.f('ix_notification_jobs_channel'), table_name='notification_jobs')
    op.drop_index(op.f('ix_notification_jobs_idempotency_key'), table_name='notification_jobs')
    op.drop_index(op.f('ix_notification_jobs_id'), table_name='notification_jobs')
    op.drop_table('notification_jobs')
