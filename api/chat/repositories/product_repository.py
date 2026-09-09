"""商品・ドキュメントに関するSupabaseへの問い合わせを集約する。"""

from typing import Any

from postgrest import APIError

from config import get_logger

logger = get_logger(__name__)


class DatabaseError(Exception):
    """データベース関連のエラー"""

    pass


def get_all_product_names(supabase_client: Any) -> list[dict]:
    """全商品の名前一覧を取得する。"""
    response = supabase_client.from_("products").select("name").execute()
    return response.data or []


def get_product_details_by_name(supabase_client: Any, name: str) -> dict | None:
    """商品名を指定して詳細情報を1件取得する。"""
    response = (
        supabase_client.from_("products")
        .select("name, description, price, features")
        .eq("name", name)
        .single()
        .execute()
    )
    return response.data


def get_product_details_by_ids(supabase_client: Any, ids: list[str]) -> list[dict]:
    """商品IDのリストを指定して詳細情報をまとめて取得する。"""
    response = (
        supabase_client.from_("products")
        .select("name, description, price, features")
        .in_("id", ids)
        .execute()
    )
    return response.data or []


def get_products_sorted_by_price(
    supabase_client: Any, desc: bool, limit: int
) -> list[dict]:
    """価格でソートした商品を指定件数取得する（価格0円の商品は除外）。"""
    response = (
        supabase_client.from_("products")
        .select("name, price")
        .gt("price", 0)
        .order("price", desc=desc)
        .limit(limit)
        .execute()
    )
    return response.data or []


def match_docs(
    supabase_client: Any,
    query_embedding: list[float],
    match_threshold: float,
    match_count: int,
) -> list[dict]:
    """ドキュメントのベクトル検索(RPC: match_docs)を実行する。

    失敗時はDatabaseErrorを送出する（呼び出し元で処理を継続できないため）。
    """
    try:
        response = supabase_client.rpc(
            "match_docs",
            {
                "query_embedding": query_embedding,
                "match_threshold": match_threshold,
                "match_count": match_count,
            },
        ).execute()
        return response.data or []
    except APIError as e:
        logger.error(f"  ❌ Supabase RPC 'match_docs' failed: {e.message}")
        raise DatabaseError(
            f"ドキュメント検索中にデータベースエラーが発生しました: {e.message}"
        ) from e


def match_products(
    supabase_client: Any,
    query_embedding: list[float],
    match_threshold: float,
    match_count: int,
) -> list[dict]:
    """商品のベクトル検索(RPC: match_products)を実行する。

    失敗は致命的ではないため、例外を送出せず空リストを返す
    （呼び出し元でログのみ出力し処理を継続する想定）。
    """
    try:
        response = supabase_client.rpc(
            "match_products",
            {
                "query_embedding": query_embedding,
                "match_threshold": match_threshold,
                "match_count": match_count,
            },
        ).execute()
        return response.data or []
    except APIError as e:
        logger.error(f"  ❌ Supabase RPC 'match_products' failed: {e.message}")
        logger.warning("  ⚠️ 商品のベクトル検索に失敗しましたが、処理を続行します")
        return []
