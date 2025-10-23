"""Add database constraints and indexes for better data integrity and performance

Revision ID: add_constraints_idx
Revises: 346c1badb427
Create Date: 2025-01-17

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_constraints_idx'
down_revision = '346c1badb427'
branch_label = None
depends_on = None


def upgrade():
    """
    Add NOT NULL constraints, CHECK constraints, and indexes.

    Note: This migration assumes the data is already clean.
    Run data cleanup before applying if needed.
    """

    # Add indexes for better query performance
    # Orders table indexes
    op.create_index('ix_orders_eta_date', 'orders', ['eta_date'], unique=False)
    op.create_index('ix_orders_etd_date', 'orders', ['etd_date'], unique=False)
    op.create_index('ix_orders_created_at', 'orders', ['created_at'], unique=False)
    op.create_index('ix_orders_terminal_id', 'orders', ['terminal_id'], unique=False)
    op.create_index('ix_orders_service', 'orders', ['service'], unique=False)
    op.create_index('ix_orders_priority', 'orders', ['priority'], unique=False)

    # Add CHECK constraints for positive quantities
    op.create_check_constraint(
        'ck_orders_positive_pallets',
        'orders',
        'pallets IS NULL OR pallets >= 0'
    )
    op.create_check_constraint(
        'ck_orders_positive_boxes',
        'orders',
        'boxes IS NULL OR boxes >= 0'
    )
    op.create_check_constraint(
        'ck_orders_positive_kilos',
        'orders',
        'kilos IS NULL OR kilos >= 0'
    )

    # Order documents table indexes
    op.create_index('ix_order_documents_order_id', 'order_documents', ['order_id'], unique=False)
    op.create_index('ix_order_documents_created_at', 'order_documents', ['created_at'], unique=False)
    op.create_index('ix_order_documents_type', 'order_documents', ['type'], unique=False)

    # Terminals table indexes
    op.create_index('ix_terminals_name', 'terminals', ['name'], unique=False)
    op.create_index('ix_terminals_account_code', 'terminals', ['account_code'], unique=False)

    # Drivers table indexes
    op.create_index('ix_drivers_name', 'drivers', ['name'], unique=False)
    op.create_index('ix_drivers_phone', 'drivers', ['phone'], unique=False)

    # Trucks table indexes (if exists)
    try:
        op.create_index('ix_trucks_license_plate', 'trucks', ['license_plate'], unique=False)
    except:
        pass  # Table might not exist

    # Trailers table indexes (if exists)
    try:
        op.create_index('ix_trailers_license_plate', 'trailers', ['license_plate'], unique=False)
    except:
        pass  # Table might not exist


def downgrade():
    """Remove constraints and indexes."""

    # Drop indexes
    op.drop_index('ix_orders_eta_date', table_name='orders')
    op.drop_index('ix_orders_etd_date', table_name='orders')
    op.drop_index('ix_orders_created_at', table_name='orders')
    op.drop_index('ix_orders_terminal_id', table_name='orders')
    op.drop_index('ix_orders_service', table_name='orders')
    op.drop_index('ix_orders_priority', table_name='orders')

    # Drop CHECK constraints
    op.drop_constraint('ck_orders_positive_pallets', 'orders', type_='check')
    op.drop_constraint('ck_orders_positive_boxes', 'orders', type_='check')
    op.drop_constraint('ck_orders_positive_kilos', 'orders', type_='check')

    # Drop other indexes
    op.drop_index('ix_order_documents_order_id', table_name='order_documents')
    op.drop_index('ix_order_documents_created_at', table_name='order_documents')
    op.drop_index('ix_order_documents_type', table_name='order_documents')

    op.drop_index('ix_terminals_name', table_name='terminals')
    op.drop_index('ix_terminals_account_code', table_name='terminals')

    op.drop_index('ix_drivers_name', table_name='drivers')
    op.drop_index('ix_drivers_phone', table_name='drivers')

    try:
        op.drop_index('ix_trucks_license_plate', table_name='trucks')
    except:
        pass

    try:
        op.drop_index('ix_trailers_license_plate', table_name='trailers')
    except:
        pass
