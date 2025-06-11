from utils.celery  import celery_app

# Import all your task modules here to register them
from tasks.presentation_tasks import generate_presentation_task

if __name__ == '__main__':
    celery_app.start()