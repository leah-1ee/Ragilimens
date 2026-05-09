from rag_pipeline.query_service import (
    generate_answer,
    get_default_config,
    list_available_configs,
    retrieve_documents,
    run_query_session,
)


def get_available_configs():
    return list_available_configs()


def run_question_session(*args, **kwargs):
    return run_query_session(*args, **kwargs)
