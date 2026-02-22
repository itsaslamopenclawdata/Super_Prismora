"""
Database maintenance and optimization utility script.
Provides functions for vacuuming, analyzing, and maintaining database performance.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy import text
from app.database.config import engine


def vacuum_analyze():
    """
    Run VACUUM ANALYZE on all tables.
    This reclaims storage and updates statistics for query optimization.
    """
    print("Running VACUUM ANALYZE...")
    with engine.connect() as conn:
        conn.execute(text("VACUUM ANALYZE;"))
        conn.commit()
    print("VACUUM ANALYZE completed successfully.")


def analyze_tables():
    """
    Run ANALYZE on all tables to update statistics.
    This helps the query planner optimize queries.
    """
    print("Running ANALYZE on all tables...")
    with engine.connect() as conn:
        conn.execute(text("ANALYZE;"))
        conn.commit()
    print("ANALYZE completed successfully.")


def reindex_database():
    """
    Rebuild all indexes in the database.
    This can improve query performance if indexes have become fragmented.
    """
    print("Running REINDEX DATABASE...")
    try:
        with engine.connect() as conn:
            # Note: REINDEX DATABASE requires exclusive locks and may be slow
            # Consider running during maintenance windows
            conn.execute(text("REINDEX DATABASE photoidentifier;"))
            conn.commit()
        print("REINDEX DATABASE completed successfully.")
    except Exception as e:
        print(f"Note: REINDEX DATABASE may require superuser privileges. Error: {e}")
        print("Consider running: 'REINDEX TABLE table_name;' for individual tables.")


def get_table_sizes():
    """
    Get the size of all tables in the database.
    Useful for monitoring and identifying large tables.
    """
    print("\nTable Sizes:")
    print("-" * 60)
    query = """
    SELECT
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
        pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS data_size,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    """

    with engine.connect() as conn:
        result = conn.execute(text(query))
        for row in result:
            print(f"{row.tablename:<35} {row.total_size:<15} (data: {row.data_size}, indexes: {row.index_size})")


def get_index_usage():
    """
    Get index usage statistics.
    Helps identify unused indexes that can be dropped.
    """
    print("\nIndex Usage Statistics:")
    print("-" * 80)
    query = """
    SELECT
        schemaname,
        tablename,
        indexname,
        idx_scan AS index_scans,
        idx_tup_read,
        idx_tup_fetch,
        pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
    ORDER BY idx_scan ASC, index_size DESC;
    """

    with engine.connect() as conn:
        result = conn.execute(text(query))
        print(f"{'Schema':<10} {'Table':<25} {'Index':<30} {'Scans':<10} {'Size':<10}")
        print("-" * 80)
        for row in result:
            print(f"{row.schemaname:<10} {row.tablename:<25} {row.indexname:<30} {row.index_scans:<10} {row.index_size:<10}")


def get_slow_queries():
    """
    Get statistics on slow queries from pg_stat_statements.
    Requires pg_stat_statements extension to be enabled.
    """
    print("\nSlow Query Statistics (Top 10):")
    print("-" * 80)

    try:
        query = """
        SELECT
            calls,
            total_time / 1000.0 / 1000.0 AS total_time_seconds,
            mean_time / 1000.0 / 1000.0 AS mean_time_seconds,
            max_time / 1000.0 / 1000.0 AS max_time_seconds,
            LEFT(query, 80) AS query_preview
        FROM pg_stat_statements
        WHERE calls > 1
        ORDER BY mean_time DESC
        LIMIT 10;
        """

        with engine.connect() as conn:
            result = conn.execute(text(query))
            print(f"{'Calls':<10} {'Total Time':<15} {'Mean Time':<15} {'Max Time':<15} {'Query':<30}")
            print("-" * 80)
            for row in result:
                print(f"{row.calls:<10} {row.total_time_seconds:<15.2f} {row.mean_time_seconds:<15.2f} {row.max_time_seconds:<15.2f} {row.query_preview:<30}")

    except Exception as e:
        print(f"Note: pg_stat_statements extension may not be enabled. Error: {e}")
        print("To enable, run: CREATE EXTENSION IF NOT EXISTS pg_stat_statements;")


def check_bloat():
    """
    Check for table and index bloat.
    Bloat occurs when dead tuples accumulate and aren't cleaned up efficiently.
    """
    print("\nTable and Index Bloat:")
    print("-" * 80)

    query = """
    SELECT
        schemaname,
        tablename,
        pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
        n_dead_tup AS dead_tuples,
        n_live_tup AS live_tuples,
        ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_ratio_percent
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY dead_ratio_percent DESC
    LIMIT 10;
    """

    with engine.connect() as conn:
        result = conn.execute(text(query))
        print(f"{'Schema':<10} {'Table':<25} {'Size':<15} {'Dead Tuples':<15} {'Dead %':<10}")
        print("-" * 80)
        for row in result:
            print(f"{row.schemaname:<10} {row.tablename:<25} {row.table_size:<15} {row.dead_tuples:<15} {row.dead_ratio_percent:<10.2f}")


def get_connection_stats():
    """
    Get database connection statistics.
    """
    print("\nConnection Statistics:")
    print("-" * 40)

    query = """
    SELECT
        count(*) AS total_connections,
        count(*) FILTER (WHERE state = 'active') AS active,
        count(*) FILTER (WHERE state = 'idle') AS idle,
        count(*) FILTER (WHERE state = 'idle in transaction') AS idle_in_transaction
    FROM pg_stat_activity
    WHERE datname = current_database();
    """

    with engine.connect() as conn:
        result = conn.execute(text(query))
        for row in result:
            print(f"Total Connections: {row.total_connections}")
            print(f"Active: {row.active}")
            print(f"Idle: {row.idle}")
            print(f"Idle in Transaction: {row.idle_in_transaction}")


def run_full_maintenance():
    """
    Run a complete database maintenance routine.
    """
    print("=" * 80)
    print("Running Full Database Maintenance")
    print("=" * 80)

    print("\n1. Checking connection stats...")
    get_connection_stats()

    print("\n2. Checking table sizes...")
    get_table_sizes()

    print("\n3. Checking for bloat...")
    check_bloat()

    print("\n4. Analyzing tables...")
    analyze_tables()

    print("\n5. Running VACUUM ANALYZE...")
    vacuum_analyze()

    print("\n6. Checking index usage...")
    get_index_usage()

    print("\n" + "=" * 80)
    print("Full Maintenance Completed!")
    print("=" * 80)


def main():
    """Main function to run maintenance tasks"""
    import argparse

    parser = argparse.ArgumentParser(description="Database maintenance and optimization utility")
    parser.add_argument(
        "action",
        choices=["vacuum", "analyze", "reindex", "sizes", "index-usage", "slow-queries", "bloat", "connections", "full"],
        help="Action to perform"
    )

    args = parser.parse_args()

    if args.action == "vacuum":
        vacuum_analyze()
    elif args.action == "analyze":
        analyze_tables()
    elif args.action == "reindex":
        reindex_database()
    elif args.action == "sizes":
        get_table_sizes()
    elif args.action == "index-usage":
        get_index_usage()
    elif args.action == "slow-queries":
        get_slow_queries()
    elif args.action == "bloat":
        check_bloat()
    elif args.action == "connections":
        get_connection_stats()
    elif args.action == "full":
        run_full_maintenance()


if __name__ == "__main__":
    main()
