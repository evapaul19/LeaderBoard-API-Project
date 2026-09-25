"""add access requests and employee roles

Revision ID: 31e46e76cc14
Revises: 8584fc0b7778
Create Date: <keep auto-generated>

"""
from alembic import op
import sqlalchemy as sa

revision = '31e46e76cc14'
down_revision = '8584fc0b7778'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "employees",
        sa.Column("clerk_user_id", sa.String(), nullable=True),
    )

    op.create_unique_constraint(
        "uq_employees_clerk_user_id",
        "employees",
        ["clerk_user_id"],
    )

    op.add_column(
        "employees",
        sa.Column(
            "role",
            sa.String(),
            nullable=False,
            server_default="user",
        ),
    )

    op.create_check_constraint(
        "ck_employees_role_valid",
        "employees",
        "role IN ('user', 'admin')",
    )

    op.create_table(
        "access_requests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "clerk_user_id",
            sa.String(),
            nullable=False,
            unique=True,
        ),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column(
            "status",
            sa.String(),
            nullable=False,
            server_default="PENDING",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("reviewed_at", sa.DateTime(), nullable=True),
        sa.Column("reviewed_by", sa.String(), nullable=True),
    )

    op.create_check_constraint(
        "ck_access_requests_status_valid",
        "access_requests",
        "status IN ('PENDING', 'APPROVED', 'REJECTED')",
    )

    op.create_index(
        "ix_access_requests_status",
        "access_requests",
        ["status"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_access_requests_status",
        table_name="access_requests",
    )

    op.drop_table("access_requests")

    op.drop_constraint(
        "ck_employees_role_valid",
        "employees",
        type_="check",
    )

    op.drop_column("employees", "role")

    op.drop_constraint(
        "uq_employees_clerk_user_id",
        "employees",
        type_="unique",
    )

    op.drop_column("employees", "clerk_user_id")