"""baseline

Revision ID: 318a7ba1cd70
Revises:
Create Date: 2026-09-21 15:21:19.431831

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "318a7ba1cd70"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "employees",
        sa.Column("employee_id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=150), nullable=False),
        sa.Column(
            "cumulative_score",
            sa.Integer(),
            nullable=True,
            server_default="0",
        ),
    )

    op.create_unique_constraint(
        "uq_employees_email",
        "employees",
        ["email"],
    )

    op.create_table(
        "employee_scores",
        sa.Column("score_id", sa.Integer(), primary_key=True),
        sa.Column(
            "employee_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column("activity", sa.String(length=150), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=True,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["employee_id"],
            ["employees.employee_id"],
            ondelete="CASCADE",
        ),
    )


def downgrade() -> None:
    op.drop_table("employee_scores")
    op.drop_constraint(
        "uq_employees_email",
        "employees",
        type_="unique",
    )
    op.drop_table("employees")