"""add integrity constraints

Revision ID: 8584fc0b7778
Revises: 318a7ba1cd70
Create Date: <keep whatever Alembic already generated>

"""
from alembic import op
import sqlalchemy as sa

# keep these exactly as they already are in your generated file
revision = '8584fc0b7778'
down_revision = '318a7ba1cd70'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_check_constraint(
        "ck_employee_scores_score_positive",
        "employee_scores",
        "score > 0",
    )

    op.create_check_constraint(
        "ck_employee_scores_activity_valid",
        "employee_scores",
        "activity IN ("
        "'Interview Panel', "
        "'OSS PR merged', "
        "'Blog Post', "
        "'Blog crosses 5,000 views in first 30 days', "
        "'Internal knowledge session', "
        "'External Community Event (Speaker)', "
        "'KubeCon or other Major Event (Speaker)', "
        "'Referral'"
        ")",
    )

    op.alter_column(
        "employees",
        "cumulative_score",
        existing_type=sa.Integer(),
        nullable=False,
        server_default="0",
    )

    op.alter_column(
        "employee_scores",
        "created_at",
        existing_type=sa.DateTime(),
        nullable=False,
        server_default=sa.text("now()"),
    )


def downgrade() -> None:
    op.drop_constraint("ck_employee_scores_score_positive", "employee_scores", type_="check")
    op.drop_constraint("ck_employee_scores_activity_valid", "employee_scores", type_="check")

    op.alter_column(
        "employees",
        "cumulative_score",
        existing_type=sa.Integer(),
        nullable=True,
    )

    op.alter_column(
        "employee_scores",
        "created_at",
        existing_type=sa.DateTime(),
        nullable=True,
    )