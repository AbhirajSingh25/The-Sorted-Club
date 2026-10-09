"""0002_admin_security_and_push_subscriptions

Revision ID: 0002_admin_security_and_push_subscriptions
Revises: 0001_initial_baseline
Create Date: 2026-10-09 21:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0002_admin_security_and_push_subscriptions'
down_revision: Union[str, None] = '0001_initial_baseline'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. admin_users
    op.create_table(
        'admin_users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('username', sa.String(length=100), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_admin_users_id'), 'admin_users', ['id'], unique=False)
    op.create_index(op.f('ix_admin_users_username'), 'admin_users', ['username'], unique=True)

    # 2. admin_push_subscriptions
    op.create_table(
        'admin_push_subscriptions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('endpoint', sa.Text(), nullable=False),
        sa.Column('p256dh', sa.Text(), nullable=False),
        sa.Column('auth', sa.Text(), nullable=False),
        sa.Column('admin_username', sa.String(length=100), server_default='admin', nullable=False),
        sa.Column('user_agent', sa.String(length=255), nullable=True),
        sa.Column('device_label', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_admin_push_subscriptions_id'), 'admin_push_subscriptions', ['id'], unique=False)
    op.create_index(op.f('ix_admin_push_subscriptions_endpoint'), 'admin_push_subscriptions', ['endpoint'], unique=True)
    op.create_index(op.f('ix_admin_push_subscriptions_admin_username'), 'admin_push_subscriptions', ['admin_username'], unique=False)
    op.create_index(op.f('ix_admin_push_subscriptions_is_active'), 'admin_push_subscriptions', ['is_active'], unique=False)

    # 3. push_logs
    op.create_table(
        'push_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('event_type', sa.String(length=100), nullable=False),
        sa.Column('recipient', sa.String(length=255), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=50), server_default='SENT', nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('sent_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_push_logs_id'), 'push_logs', ['id'], unique=False)
    op.create_index(op.f('ix_push_logs_event_type'), 'push_logs', ['event_type'], unique=False)
    op.create_index(op.f('ix_push_logs_status'), 'push_logs', ['status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_push_logs_status'), table_name='push_logs')
    op.drop_index(op.f('ix_push_logs_event_type'), table_name='push_logs')
    op.drop_index(op.f('ix_push_logs_id'), table_name='push_logs')
    op.drop_table('push_logs')

    op.drop_index(op.f('ix_admin_push_subscriptions_is_active'), table_name='admin_push_subscriptions')
    op.drop_index(op.f('ix_admin_push_subscriptions_admin_username'), table_name='admin_push_subscriptions')
    op.drop_index(op.f('ix_admin_push_subscriptions_endpoint'), table_name='admin_push_subscriptions')
    op.drop_index(op.f('ix_admin_push_subscriptions_id'), table_name='admin_push_subscriptions')
    op.drop_table('admin_push_subscriptions')

    op.drop_index(op.f('ix_admin_users_username'), table_name='admin_users')
    op.drop_index(op.f('ix_admin_users_id'), table_name='admin_users')
    op.drop_table('admin_users')
