from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Any
from sqlalchemy.orm import Session
from elasticsearch import Elasticsearch
from app.database import get_db
from app.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/api/v1/search", tags=["search"])

# Elasticsearch client
es = Elasticsearch([settings.ELASTICSEARCH_URL])


class SearchResult(BaseModel):
    """Single search result."""

    id: str
    type: str
    score: float
    source: dict


class SearchResponse(BaseModel):
    """Search response."""

    total: int
    took: float
    results: List[SearchResult]
    aggregations: Optional[dict] = None


class IndexDocument(BaseModel):
    """Document to index."""

    id: Optional[str] = None
    type: str
    title: str
    description: Optional[str] = None
    tags: List[str] = []
    metadata: Optional[dict] = {}


class BulkIndexRequest(BaseModel):
    """Bulk index request."""

    documents: List[IndexDocument]


async def get_index_name(document_type: str) -> str:
    """Get Elasticsearch index name for document type."""
    return f"{settings.ELASTICSEARCH_INDEX_PREFIX}_{document_type}"


@router.post("/index", status_code=status.HTTP_201_CREATED)
async def index_document(
    document: IndexDocument,
    db: Session = Depends(get_db),
):
    """
    Index a document in Elasticsearch.

    Supported document types:
    - photos: Photo records
    - users: User profiles
    - collections: Photo collections
    - identifications: AI identification results
    """
    index_name = await get_index_name(document.type)

    try:
        # Create index if it doesn't exist
        if not es.indices.exists(index=index_name):
            es.indices.create(
                index=index_name,
                body={
                    "mappings": {
                        "properties": {
                            "title": {"type": "text"},
                            "description": {"type": "text"},
                            "tags": {"type": "keyword"},
                            "metadata": {"type": "object"},
                            "created_at": {"type": "date"},
                        }
                    }
                },
            )

        # Index document
        doc_body = {
            "title": document.title,
            "description": document.description,
            "tags": document.tags,
            "metadata": document.metadata or {},
            "created_at": "now",
        }

        result = es.index(
            index=index_name,
            id=document.id,
            body=doc_body,
        )

        return {
            "id": result["_id"],
            "index": result["_index"],
            "result": result["result"],
            "message": "Document indexed successfully",
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to index document: {str(e)}",
        )


@router.post("/index/bulk", status_code=status.HTTP_201_CREATED)
async def bulk_index_documents(
    request: BulkIndexRequest,
    db: Session = Depends(get_db),
):
    """
    Bulk index multiple documents in Elasticsearch.
    """
    results = []
    errors = []

    for document in request.documents:
        try:
            index_name = await get_index_name(document.type)

            # Create index if it doesn't exist
            if not es.indices.exists(index=index_name):
                es.indices.create(
                    index=index_name,
                    body={
                        "mappings": {
                            "properties": {
                                "title": {"type": "text"},
                                "description": {"type": "text"},
                                "tags": {"type": "keyword"},
                                "metadata": {"type": "object"},
                                "created_at": {"type": "date"},
                            }
                        }
                    },
                )

            # Index document
            doc_body = {
                "title": document.title,
                "description": document.description,
                "tags": document.tags,
                "metadata": document.metadata or {},
                "created_at": "now",
            }

            result = es.index(
                index=index_name,
                id=document.id,
                body=doc_body,
            )

            results.append({
                "id": result["_id"],
                "index": result["_index"],
                "result": result["result"],
            })

        except Exception as e:
            errors.append({
                "document": document.dict(),
                "error": str(e),
            })

    return {
        "indexed": len(results),
        "failed": len(errors),
        "results": results,
        "errors": errors,
    }


@router.get("/", response_model=SearchResponse)
async def search(
    query: str = Query(..., description="Search query"),
    document_type: Optional[str] = Query(None, description="Filter by document type"),
    tags: Optional[List[str]] = Query(None, description="Filter by tags"),
    from_: int = Query(0, ge=0, alias="from", description="Pagination offset"),
    size: int = Query(10, ge=1, le=100, description="Number of results"),
    db: Session = Depends(get_db),
):
    """
    Search across all indexed documents.

    Supports full-text search, filtering by type and tags.
    """
    try:
        # Build search query
        search_body = {
            "query": {
                "bool": {
                    "must": [
                        {
                            "multi_match": {
                                "query": query,
                                "fields": ["title^2", "description", "tags"],
                                "fuzziness": "AUTO",
                            }
                        }
                    ]
                }
            },
            "from": from_,
            "size": size,
            "highlight": {
                "fields": {
                    "title": {},
                    "description": {},
                }
            },
        }

        # Add filters
        if document_type:
            search_body["query"]["bool"]["filter"] = [{"term": {"_index": await get_index_name(document_type)}}]

        if tags:
            search_body["query"]["bool"]["must"].append({"terms": {"tags": tags}})

        # Execute search
        result = es.search(
            index=f"{settings.ELASTICSEARCH_INDEX_PREFIX}_*",
            body=search_body,
        )

        # Format results
        search_results = []
        for hit in result["hits"]["hits"]:
            search_results.append(
                SearchResult(
                    id=hit["_id"],
                    type=hit["_index"].replace(f"{settings.ELASTICSEARCH_INDEX_PREFIX}_", ""),
                    score=hit["_score"],
                    source={
                        **hit["_source"],
                        "highlight": hit.get("highlight", {}),
                    },
                )
            )

        return SearchResponse(
            total=result["hits"]["total"]["value"],
            took=result["took"],
            results=search_results,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search failed: {str(e)}",
        )


@router.get("/suggest")
async def suggest(
    query: str = Query(..., description="Query for suggestions"),
    document_type: Optional[str] = Query(None),
    size: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """
    Get autocomplete suggestions for search query.
    """
    try:
        search_body = {
            "suggest": {
                "title_suggest": {
                    "prefix": query,
                    "completion": {
                        "field": "title",
                        "size": size,
                    },
                }
            },
        }

        index = f"{settings.ELASTICSEARCH_INDEX_PREFIX}_*" if not document_type else await get_index_name(
            document_type
        )

        result = es.search(index=index, body=search_body)

        suggestions = []
        for suggestion in result["suggest"]["title_suggest"][0]["options"]:
            suggestions.append(suggestion["text"])

        return {
            "query": query,
            "suggestions": suggestions,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Suggestion failed: {str(e)}",
        )


@router.get("/aggregations")
async def get_aggregations(
    query: str = Query("*"),
    document_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Get search aggregations for faceted search.

    Returns counts by document type, tags, etc.
    """
    try:
        search_body = {
            "query": {
                "multi_match": {
                    "query": query,
                    "fields": ["title", "description"],
                }
            },
            "size": 0,
            "aggs": {
                "by_type": {
                    "terms": {"field": "_index", "size": 10},
                },
                "by_tags": {
                    "terms": {"field": "tags", "size": 20},
                },
            },
        }

        index = f"{settings.ELASTICSEARCH_INDEX_PREFIX}_*" if not document_type else await get_index_name(
            document_type
        )

        result = es.search(index=index, body=search_body)

        return {
            "query": query,
            "aggregations": result["aggregations"],
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Aggregation failed: {str(e)}",
        )


@router.delete("/{document_type}/{document_id}")
async def delete_document(
    document_type: str,
    document_id: str,
    db: Session = Depends(get_db),
):
    """
    Delete a document from the search index.
    """
    try:
        index_name = await get_index_name(document_type)

        result = es.delete(
            index=index_name,
            id=document_id,
        )

        return {
            "id": document_id,
            "type": document_type,
            "result": result["result"],
            "message": "Document deleted successfully",
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document: {str(e)}",
        )


@router.delete("/index/{document_type}")
async def delete_index(
    document_type: str,
    db: Session = Depends(get_db),
):
    """
    Delete an entire search index.

    WARNING: This is destructive and cannot be undone.
    """
    try:
        index_name = await get_index_name(document_type)

        if not es.indices.exists(index=index_name):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Index '{document_type}' not found",
            )

        result = es.indices.delete(index=index_name)

        return {
            "type": document_type,
            "acknowledged": result["acknowledged"],
            "message": f"Index '{document_type}' deleted successfully",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete index: {str(e)}",
        )


@router.get("/indices")
async def list_indices(db: Session = Depends(get_db)):
    """
    List all search indices.
    """
    try:
        result = es.indices.get(index=f"{settings.ELASTICSEARCH_INDEX_PREFIX}_*")

        indices = []
        for index_name in result.keys():
            index_info = es.indices.get(index=index_name)
            indices.append(
                {
                    "name": index_name,
                    "type": index_name.replace(f"{settings.ELASTICSEARCH_INDEX_PREFIX}_", ""),
                    "document_count": es.count(index=index_name)["count"],
                }
            )

        return {
            "indices": indices,
            "count": len(indices),
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list indices: {str(e)}",
        )


@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Check search service and Elasticsearch health."""
    try:
        es_health = es.cluster.health()
        es_status = es_health["status"]

        return {
            "service": "search",
            "status": "healthy" if es_status in ["yellow", "green"] else "degraded",
            "elasticsearch": {
                "status": es_status,
                "nodes": es_health["number_of_nodes"],
                "active_shards": es_health["active_shards"],
            },
        }

    except Exception as e:
        return {
            "service": "search",
            "status": "unhealthy",
            "error": str(e),
        }
