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

    # Function to keep employees.cumulative_score in sync
    # whenever employee_scores changes.
    op.execute("""
        CREATE OR REPLACE FUNCTION fn_update_cumulative_score()
        RETURNS TRIGGER AS $$
        BEGIN
            IF TG_OP = 'INSERT' THEN
                UPDATE employees
                SET cumulative_score = cumulative_score + NEW.score
                WHERE employee_id = NEW.employee_id;
                RETURN NEW;

            ELSIF TG_OP = 'UPDATE' THEN
                UPDATE employees
                SET cumulative_score = cumulative_score - OLD.score + NEW.score
                WHERE employee_id = NEW.employee_id;
                RETURN NEW;

            ELSIF TG_OP = 'DELETE' THEN
                UPDATE employees
                SET cumulative_score = cumulative_score - OLD.score
                WHERE employee_id = OLD.employee_id;
                RETURN OLD;
            END IF;

            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;
    """)

    # Automatically update cumulative_score when a score is
    # inserted, updated, or deleted.
    op.execute("""
        CREATE TRIGGER trg_employee_scores_change
        AFTER INSERT OR UPDATE OR DELETE ON employee_scores
        FOR EACH ROW
        EXECUTE FUNCTION fn_update_cumulative_score();
    """)


def downgrade() -> None:
    op.execute(
        "DROP TRIGGER IF EXISTS trg_employee_scores_change "
        "ON employee_scores"
    )

    op.execute(
        "DROP FUNCTION IF EXISTS fn_update_cumulative_score()"
    )

    op.drop_table("employee_scores")

    op.drop_constraint(
        "uq_employees_email",
        "employees",
        type_="unique",
    )

    op.drop_table("employees")